import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const client = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export const POST = async (req: NextRequest) => {
  try {
    const { amount, name, email } = await req.json();
    if (!amount || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let customer;

    const existingCustomer = await client.customers.list({ email });

    if (existingCustomer.data.length > 0) {
      customer = existingCustomer.data[0];
    } else {
      customer = await client.customers.create({
        email,
        name,
      });
    }

    const ephemeralKey = await client.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2024-06-20' }
    );

    const paymentIntent = await client.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
      customer: customer.id,
    });
    return NextResponse.json(
      {
        paymentIntent,
        ephemeralKey,
        customer: customer.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};

export const PUT = async (req: NextRequest) => {
  try {
    const { payment_method_id, payment_intent_id, customer_id } =
      await req.json();
    if (!payment_method_id || !payment_intent_id || !customer_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const paymentMethod = await client.paymentMethods.attach(
      payment_method_id,
      { customer: customer_id }
    );

    const result = await client.paymentIntents.confirm(payment_intent_id, {
      payment_method: paymentMethod.id,
    });
    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};
