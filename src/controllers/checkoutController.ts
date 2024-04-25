// User
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Transactions from "../models/transactions/transactionModel";
import User from "../models/user/userModel";
import dotenv from "dotenv";
dotenv.config();
import Stripe from "stripe";

const stripe = new Stripe(
  "sk_test_51P3Dg0SFbrlOtlupwDCCmAMC4m67Ji3ycQMfozETC5sawQ9Zkd7yPtUcUs6twrhsGxGep2EBZcGu7VmDMgNXmkcx00K2XpYzKp"
);

// @desc    Generate stripe session
// @route   get /post/get-post
// @access  Public

export const initiatecheckoutController = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.body;
    console.log(userId+"checkout")

    try {
      const user = await User.findById(userId);

      if (user && user.isVerified === true) {
        res.json({
          success: false,
          message: "User is already subscribed to premium",
          user,
        });
      }

      const fare = "499";
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: "Shuffle premium membership - 1Year",
              },
              unit_amount: parseInt(fare) * 100,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.DOMAIN_NAME}/payment-success`,
        cancel_url: `${process.env.DOMAIN_NAME}/premium/payment-failed`,
        customer_email: user?.email,
        billing_address_collection: "required",
      });

      console.log("Stripe session created:", session);
      res.json({ success: true, id: session.id });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res
        .status(500)
        .json({ success: false, message: "Error creating checkout session" });
    }
  }
);

// @desc    validate payment
// @route   get /post/get-post
// @access  Public

export const validatePaymentController = async (
  req: Request,
  res: Response
) => {
  const { sessionId, userId } = req.body;
  const amount = "499";

  try {
    const user = await User.findById(userId);

    if (user && user.isVerified === true) {
      return res.json({
        success: false,
        message: "User is already subscribed to premium",
      });
    }

    const existingPremium = await Transactions.findOne({
      transactionId: sessionId,
    });

    if (existingPremium) {
      return res
        .status(400)
        .json({ success: false, message: "Unauthorized access" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session && session.payment_status === "paid") {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 364);
      

      const newPremium = new Transactions({
        userId,
        amount,
        transactionId: sessionId,
        startDate: Date.now(),
        expiryDate,
      });

      await newPremium.save();

      await User.findByIdAndUpdate(userId, { isVerified: true, premiumExpiryDate:expiryDate});
      const updatedUser = await User.findById(userId, { password: 0 });

      return res.json({
        success: true,
        message: "Premium document created and user updated successfully",
        user: updatedUser,
      });
    } else {
      return res.json({ success: false, message: "Payment not successful" });
    }
  } catch (error) {
    console.error("Error processing successful payment:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error processing successful payment" });
  }
};

// @desc    Get all user transactions
// @route   get /post/get-post
// @access  Public

export const getPremiumUserDataController = async (
  req: Request,
  res: Response
) => {
  const { userId } = req.body;

  try {
    const allPremiumUserData = await Transactions.find({userId});

    const latestPremiumUser = await Transactions.findOne({ userId }).sort({
      startDate: -1,
    });

    res
      .status(200)
      .json({ success: true, allPremiumUserData, latestPremiumUser });
  } catch (error) {
    console.error("Error fetching premium user data:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching premium user data" });
  }
};
