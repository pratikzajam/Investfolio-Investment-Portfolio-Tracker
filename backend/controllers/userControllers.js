// const validate = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const userModels = require("../models/userModels");
const asset = require("../models/asset.model.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Details" });
    }

    // if (!validate.isEmail(email)) {
    //   return res.status(400).json({ success: false, message: "Enter a valid email" });
    // }

    if (password.length < 6) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Enter a strong password (min. 6 chars)",
        });
    }

    const existingUser = await userModels.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new userModels({ name, email, password: hashPassword });
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({ success: true, token });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing email or password" });
    }

    const user = await userModels.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({ success: true, token });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getUserData = async (req, res) => {
  try {
    let UserId = req.user?.id;

    const user = await userModels.findById(UserId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      userData: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

const isAuth = async (req, res) => {
  console.log("Api Hit");
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res
      .status(403)
      .json({ success: false, message: "Token is missing." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return res.status(200).json({
      success: true,
      message: "User is authenticated",
      userData: decoded,
    });
  } catch (error) {
    // If token is invalid or expired
    console.error("Token verification failed:", error);
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

const addAsset = async (req, res) => {
  try {
    const {
      assetName,
      symbol,
      assetType,
      Quantity,
      currentPrice,
      purchaseDate,
      logoUrl,
      purchasePrice,
    } = req.body || {};

    if (
      !assetName ||
      !symbol ||
      !assetType ||
      !Quantity ||
      !purchaseDate ||
      !currentPrice ||
      !logoUrl ||
      !purchasePrice
    ) {
      return res.status(403).json({
        status: false,
        message: "All Fields Are Required",
        data: null,
      });
    }


    const parsedPrice = parseFloat(currentPrice);
    if (isNaN(parsedPrice)) {
      return res.status(403).json({
        status: false,
        message: "Current Price should be a valid number",
        data: null,
      });
    }

    const parsedPurchasedPrice = parseFloat(purchasePrice);
    if (isNaN(parsedPrice)) {
      return res.status(403).json({
        status: false,
        message: "Purchased Price should be a valid number",
        data: null,
      });
    }

    const parsedDate = new Date(purchaseDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(403).json({
        status: false,
        message: "Purchase Date should be a valid date",
        data: null,
      });
    }

    try {
      let addAsset = await asset.insertOne({
        userId: req.user.id,
        assetName,
        symbol,
        assetType,
        Quantity: Number(Quantity),
        purchaseDate: parsedDate,
        currentPrice: parsedPrice,
        purchasePrice: parsedPurchasedPrice,
        logoUrl,
      });

      if (addAsset._id) {
        return res.status(200).json({
          status: true,
          message: "asset added sucessfullys",
          data: null,
        });
      }
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: error.message,
        data: null,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};

const deleteAsset = async (req, res) => {
  try {
    const { assetId } = req.params;

    console.log(typeof assetId);

    console.log(assetId);

    if (!assetId) {
      return res.status(403).json({
        status: false,
        message: "No Asset Id Found",
        data: null,
      });
    }

    let isAssetExists = await asset.findOne({ _id: assetId });
    console.log(isAssetExists);

    if (!isAssetExists) {
      return res.status(403).json({
        status: false,
        message: "No Asset Found",
        data: null,
      });
    }

    let deleteAsset = await asset.deleteOne({ _id: assetId });

    if (deleteAsset.deletedCount == 1) {
      return res.status(200).json({
        status: true,
        message: "Asset Deleted Successfully",
        data: null
      });
    } else {
      return res.status(200).json({
        status: false,
        message: "Something went wrong while deleting the asset",
        data: null
      });
    }
  } catch (error) {
    return res.status(200).json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};

// const updateAsset = async (req, res) => {

//   try {

//     const { assetId } = req.params;
//     const { assetId } = req.body;

//     console.log(typeof (assetId))

//     console.log(assetId)

//     if (!assetId) {
//       return res.status(403).json({
//         status: false,
//         message: "No Asset Id Found",
//         data: null
//       });
//     }

//     let isAssetExists = await asset.findOne({ _id: assetId });
//     console.log(isAssetExists)

//     if (!isAssetExists) {
//       return res.status(403).json({
//         status: false,
//         message: "No Asset Found",
//         data: null
//       });
//     }

//     let deleteAsset = await asset.deleteOne({ _id: assetId });

//     if (deleteAsset.deletedCount == 1) {
//       return res.status(200).json({
//         status: false,
//         message: "Asset Deleted Sucessfully",
//         data: null
//       });
//     } else {
//       return res.status(200).json({
//         status: false,
//         message: "Something Went wrong While deletinh the asset",
//         data: null
//       });

//     }

//   } catch (error) {
//     return res.status(200).json({
//       status: false,
//       message: error.message,
//       data: null
//     });
//   }

// };

const getAssetDetails = async (req, res) => {
  try {
    const assets = await asset.find({ userId: req.user.id });

    if (assets.length === 0) {
      return res.status(200).json({
        status: true,
        message: "No assets found",
        data: [],
        stats: {
          portfolioValue: 0,
          portfolioChangeAmount: 0,
          portfolioChangePercent: 0,
          allocation: {}
        }
      });
    }

    const transformedAssets = assets.map((assetItem) => ({
      id: assetItem._id.toString(), // Use MongoDB's ObjectId as the id
      name: assetItem.assetName,
      symbol: assetItem.symbol,
      type: assetItem.assetType,
      quantity: assetItem.Quantity || 0,
      purchasePrice: assetItem.purchasePrice || 0,
      currentPrice: assetItem.currentPrice,
      purchaseDate: assetItem.purchaseDate.toISOString().split("T")[0],
      logoUrl: assetItem.logoUrl,
    }));

    // Calculate portfolio statistics in backend
    const totalValue = transformedAssets.reduce((sum, item) => sum + (item.currentPrice * item.quantity), 0);
    const totalInvested = transformedAssets.reduce((sum, item) => sum + (item.purchasePrice * item.quantity), 0);
    const changeAmount = totalValue - totalInvested;
    const changePercent = totalInvested > 0 ? (changeAmount / totalInvested) * 100 : 0;

    // Calculate asset allocation in backend
    const allocation = {};
    transformedAssets.forEach(item => {
      const value = item.currentPrice * item.quantity;
      allocation[item.type] = (allocation[item.type] || 0) + value;
    });

    return res.status(200).json({
      status: true,
      message: "Assets fetched successfully",
      data: transformedAssets,
      stats: {
        portfolioValue: totalValue,
        portfolioChangeAmount: changeAmount,
        portfolioChangePercent: changePercent,
        allocation
      }
    });
  } catch (error) {
    return res.status(403).json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({
        status: false,
        message: "Message is required",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return res.status(500).json({
        status: false,
        message: "Gemini API key is not configured on the backend.",
      });
    }

    // Retrieve user assets to build context dynamically in the backend
    const userAssets = await asset.find({ userId: req.user.id });
    
    const transformedAssets = userAssets.map((assetItem) => ({
      name: assetItem.assetName,
      symbol: assetItem.symbol,
      type: assetItem.assetType,
      quantity: assetItem.Quantity || 0,
      currentPrice: assetItem.currentPrice || 0,
      purchasePrice: assetItem.purchasePrice || 0,
    }));

    // Calculate portfolio statistics
    const totalValue = transformedAssets.reduce((sum, item) => sum + (item.currentPrice * item.quantity), 0);
    const totalInvested = transformedAssets.reduce((sum, item) => sum + (item.purchasePrice * item.quantity), 0);
    const changeAmount = totalValue - totalInvested;
    const changePercent = totalInvested > 0 ? (changeAmount / totalInvested) * 100 : 0;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });

    const systemInstruction = `You are the Investfolio AI assistant. You help the user manage, optimize, and analyze their investments.
Here is the user's current portfolio status (queried securely from the database):
- Total Value: $${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Profit/Loss: $${changeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${changePercent.toFixed(2)}%)
- Assets Owned: ${transformedAssets.length > 0 ? JSON.stringify(transformedAssets) : "No assets added yet"}

Answer user questions about their portfolio or general financial queries. Be friendly, concise, and professional. Provide helpful suggestions but clarify you aren't providing official financial advice.`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `${systemInstruction}\n\nUser: ${message}` }] }]
    });

    const responseText = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't get a response. Please try again.";

    return res.status(200).json({
      status: true,
      message: "Chat processed successfully",
      data: responseText,
    });

  } catch (error) {
    console.error("ChatBot backend error:", error);
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserData,
  isAuth,
  addAsset,
  getAssetDetails,
  deleteAsset,
  chatWithAI,
};
