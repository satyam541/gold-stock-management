import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user || !user.isActive) {
      return NextResponse.json({
        message: "If an account with that email exists, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Invalidate any existing tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    // Create new token
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // Get SMTP settings from database
    const smtpSettings = await prisma.appSetting.findMany({
      where: {
        key: {
          in: [
            "smtp_host",
            "smtp_port",
            "smtp_user",
            "smtp_pass",
            "smtp_from_email",
            "smtp_from_name",
          ],
        },
      },
    });

    const smtp: Record<string, string> = {};
    smtpSettings.forEach((s) => {
      smtp[s.key] = s.value;
    });

    if (!smtp.smtp_host || !smtp.smtp_port) {
      console.error("SMTP settings not configured");
      return NextResponse.json({
        message: "If an account with that email exists, a password reset link has been sent.",
      });
    }

    // Send reset email
    const transporter = nodemailer.createTransport({
      host: smtp.smtp_host,
      port: parseInt(smtp.smtp_port),
      secure: parseInt(smtp.smtp_port) === 465,
      auth: smtp.smtp_user
        ? {
            user: smtp.smtp_user,
            pass: smtp.smtp_pass,
          }
        : undefined,
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"${smtp.smtp_from_name || "AssetFlow"}" <${smtp.smtp_from_email || smtp.smtp_user}>`,
      to: user.email,
      subject: "Password Reset - AssetFlow",
      html: `
        <div style="max-width: 500px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #b8860b, #daa520); padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px;">AssetFlow</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px;">Password Reset Request</p>
          </div>
          <div style="background: #fff; padding: 24px; border: 1px solid #e5e5e5; border-top: 0; border-radius: 0 0 12px 12px;">
            <p style="color: #333; font-size: 14px;">Hello <strong>${user.name}</strong>,</p>
            <p style="color: #555; font-size: 14px;">We received a request to reset your password. Click the button below to set a new password:</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #b8860b, #daa520); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #888; font-size: 12px;">This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
