const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const CartItem = require('../model/cartModel');
const Product = require('../model/productModel');

// Get user's cart
router.get('/', verifyToken, async (req, res) => {
  try {
    const cartItems = await CartItem.find({ user: req.user.id })
      .populate('product', 'name price image category subcategory');

    // Format cart items for frontend
    const items = cartItems.map(item => ({
      productId: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.image,
      category: item.product.category,
      subcategory: item.product.subcategory
    }));

    res.json({
      success: true,
      items
    });
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Add product to cart
router.post('/add', verifyToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Validate input
    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product or quantity'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product is already in cart
    let cartItem = await CartItem.findOne({
      user: req.user.id,
      product: productId
    });

    if (cartItem) {
      // Update quantity if already in cart
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // Add new item to cart
      cartItem = new CartItem({
        user: req.user.id,
        product: productId,
        quantity
      });
      await cartItem.save();
    }

    res.json({
      success: true,
      message: 'Product added to cart'
    });
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update cart item quantity
router.put('/update', verifyToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // Validate input
    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product or quantity'
      });
    }

    // Find and update cart item
    const cartItem = await CartItem.findOne({
      user: req.user.id,
      product: productId
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not in cart'
      });
    }

    // Update quantity
    cartItem.quantity = quantity;
    await cartItem.save();

    res.json({
      success: true,
      message: 'Cart updated'
    });
  } catch (err) {
    console.error('Error updating cart:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Remove item from cart
router.delete('/:productId', verifyToken, async (req, res) => {
  try {
    const productId = req.params.productId;

    // Find and remove cart item
    const result = await CartItem.findOneAndDelete({
      user: req.user.id,
      product: productId
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Item not in cart'
      });
    }

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (err) {
    console.error('Error removing from cart:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Clear cart
router.delete('/', verifyToken, async (req, res) => {
  try {
    await CartItem.deleteMany({ user: req.user.id });

    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (err) {
    console.error('Error clearing cart:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 