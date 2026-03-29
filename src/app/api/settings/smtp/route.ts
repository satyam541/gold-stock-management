import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import nodemailer from "nodemailer";

// GET SMTP settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const smtpKeys = [
      "smtp_host",
      "smtp_port",
      "smtp_user",
      "smtp_pass",
      "smtp_from_email",
      "smtp_from_name",
      "smtp_encryption",
    ];

    const settings = await prisma.appSetting.findMany({
      where: { key: { in: smtpKeys } },
    });

    const result: Record<string, string> = {};
    settings.forEach((s) => {
      result[s.key] = s.value;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get SMTP settings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch SMTP settings" },
      { status: 500 }
    );
  }
}

// PUT - Save SMTP settings
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await request.json();

    const smtpKeys = [
      "smtp_host",
      "smtp_port",
      "smtp_user",
      "smtp_pass",
      "smtp_from_email",
      "smtp_from_name",
      "smtp_encryption",
    ];

    for (const key of smtpKeys) {
      if (data[key] !== undefined) {
        await prisma.appSetting.upsert({
          where: { key },
          create: { key, value: data[key] || "" },
          update: { value: data[key] || "" },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save SMTP settings error:", error);
    return NextResponse.json(
      { error: "Failed to save SMTP settings" },
      { status: 500 }
    );
  }
}

// POST - Test SMTP connection
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from_email, smtp_from_name, smtp_encryption } =
      await request.json();

    if (!smtp_host || !smtp_port) {
      return NextResponse.json(
        { error: "SMTP host and port are required" },
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtp_host,
      port: parseInt(smtp_port),
      secure: smtp_encryption === "ssl" || parseInt(smtp_port) === 465,
      auth: smtp_user
        ? {
            user: smtp_user,
            pass: smtp_pass,
          }
        : undefined,
    });

    // Verify connection
    await transporter.verify();

    // Send test email to logged-in user
    await transporter.sendMail({
      from: `"${smtp_from_name || "AssetFlow"}" <${smtp_from_email || smtp_user}>`,
      to: session.user.email,
      subject: "AssetFlow - SMTP Test Email",
      html: `
        <div style="max-width: 500px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #b8860b, #daa520); padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 22px;">AssetFlow</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px;">SMTP Test</p>
          </div>
          <div style="background: #fff; padding: 24px; border: 1px solid #e5e5e5; border-top: 0; border-radius: 0 0 12px 12px;">
            <p style="color: #333; font-size: 14px;">Your SMTP configuration is working correctly!</p>
            <p style="color: #888; font-size: 12px;">This is a test email from AssetFlow Management Suite.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${session.user.email}`,
    });
  } catch (error: any) {
    console.error("SMTP test error:", error);
    return NextResponse.json(
      {
        error: `SMTP test failed: ${error.message || "Connection error"}`,
      },
      { status: 400 }
    );
  }
}
