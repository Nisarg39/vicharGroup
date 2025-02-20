import Razorpay from 'razorpay';
import { NextRequest, NextResponse } from 'next/server';

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be provided');
}

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
    const { amount, couponCode } = await request.json();
    console.log(amount, couponCode);
    try {
        const options = {
            amount: Number(amount * 100),
            currency: "INR",
            receipt: "receipt_" + Math.random().toString(36).substring(7),
        };

        const order = await razorpay.orders.create(options);
        console.log(order)
        return NextResponse.json({
            id: order.id,
            amount: order.amount / 100,
            key: process.env.RAZORPAY_KEY_ID,
        }, { status: 200 });
    } catch (error) {
        console.error('Razorpay error:', error);
        return NextResponse.json({ error: error.message || 'Payment initialization failed' }, { status: 500 });
    }
}