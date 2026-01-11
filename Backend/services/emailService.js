import nodemailer from "nodemailer";

/**
 * Email Service for Organizer Application Notifications
 * Handles all email communications related to organizer applications
 */

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send email notification when application is submitted
 * @param {Object} user - User object with email and name
 * @param {Object} application - Application object with details
 */
export const sendApplicationSubmittedEmail = async (user, application) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "✅ Organizer Application Received - Under Review",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .timeline { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .timeline-item { display: flex; align-items: center; margin: 10px 0; }
          .timeline-icon { width: 30px; height: 30px; background: #667eea; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🎉 Application Received!</h1>
          </div>
          <div class="content">
            <p style="font-size: 16px;">Dear <strong>${user.name}</strong>,</p>
            
            <p>Thank you for submitting your organizer application! We're excited about your interest in creating positive change through our platform.</p>
            
            <div class="info-box">
              <h3 style="margin-top: 0; color: #667eea;">📋 Application Details</h3>
              <p><strong>Organization:</strong> ${application.organizationName}</p>
              <p><strong>Type:</strong> ${application.organizationType}</p>
              <p><strong>Submitted:</strong> ${new Date(application.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              <p><strong>Application ID:</strong> ${application._id}</p>
            </div>

            <div class="timeline">
              <h3 style="margin-top: 0; color: #667eea;">⏱️ What Happens Next?</h3>
              <div class="timeline-item">
                <div class="timeline-icon">1</div>
                <div>
                  <strong>Document Review</strong><br>
                  <span style="color: #6b7280;">Our team will verify your submitted documents</span>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-icon">2</div>
                <div>
                  <strong>Background Check</strong><br>
                  <span style="color: #6b7280;">We'll review your organization details and mission</span>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-icon">3</div>
                <div>
                  <strong>Decision</strong><br>
                  <span style="color: #6b7280;">You'll receive an email with our decision within 2-3 business days</span>
                </div>
              </div>
            </div>

            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0;"><strong>⚡ Expected Review Time:</strong> 2-3 business days</p>
            </div>

            <p style="margin-top: 30px;">If you have any questions or need to provide additional information, please don't hesitate to contact our support team.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}" class="button">Visit Dashboard</a>
            </div>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} Fundraising Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Application submitted email sent to ${user.email}`);
  } catch (error) {
    console.error("❌ Error sending application submitted email:", error);
    throw error;
  }
};

/**
 * Send email notification when application is approved
 * @param {Object} user - User object with email and name
 * @param {Object} application - Application object with details
 */
export const sendApplicationApprovedEmail = async (user, application) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "🎉 Congratulations! Your Organizer Application Has Been Approved",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .info-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .feature-item { background: white; padding: 15px; border-radius: 5px; text-align: center; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 32px;">🎉 Welcome Aboard!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px;">Your Application Has Been Approved</p>
          </div>
          <div class="content">
            <p style="font-size: 16px;">Dear <strong>${user.name}</strong>,</p>
            
            <div class="success-box">
              <h2 style="margin-top: 0; color: #059669;">✅ Congratulations!</h2>
              <p style="margin: 0; font-size: 16px;">We're thrilled to inform you that your organizer application for <strong>${application.organizationName}</strong> has been approved! You can now start creating campaigns and making a difference.</p>
            </div>

            <div class="info-box">
              <h3 style="margin-top: 0; color: #10b981;">🚀 What You Can Do Now</h3>
              <div class="feature-grid">
                <div class="feature-item">
                  <div style="font-size: 32px; margin-bottom: 10px;">📝</div>
                  <strong>Create Campaigns</strong>
                  <p style="font-size: 14px; color: #6b7280; margin: 5px 0 0 0;">Launch fundraising campaigns for your cause</p>
                </div>
                <div class="feature-item">
                  <div style="font-size: 32px; margin-bottom: 10px;">💰</div>
                  <strong>Receive Donations</strong>
                  <p style="font-size: 14px; color: #6b7280; margin: 5px 0 0 0;">Accept contributions from supporters</p>
                </div>
                <div class="feature-item">
                  <div style="font-size: 32px; margin-bottom: 10px;">📊</div>
                  <strong>Track Progress</strong>
                  <p style="font-size: 14px; color: #6b7280; margin: 5px 0 0 0;">Monitor your campaign performance</p>
                </div>
                <div class="feature-item">
                  <div style="font-size: 32px; margin-bottom: 10px;">🤝</div>
                  <strong>Engage Donors</strong>
                  <p style="font-size: 14px; color: #6b7280; margin: 5px 0 0 0;">Build relationships with your community</p>
                </div>
              </div>
            </div>

            <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #1e40af;">📚 Getting Started Tips</h4>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Create a compelling campaign story with clear goals</li>
                <li>Add high-quality images and videos to your campaigns</li>
                <li>Share your campaigns on social media to reach more supporters</li>
                <li>Keep your donors updated with regular progress reports</li>
                <li>Respond promptly to donor questions and comments</li>
              </ul>
            </div>

            <div class="info-box">
              <h3 style="margin-top: 0; color: #10b981;">📋 Application Details</h3>
              <p><strong>Organization:</strong> ${application.organizationName}</p>
              <p><strong>Type:</strong> ${application.organizationType}</p>
              <p><strong>Approved On:</strong> ${new Date(application.reviewedAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/create-campaign" class="button">Create Your First Campaign</a>
            </div>

            <p style="margin-top: 30px; text-align: center; color: #6b7280;">We're excited to see the positive impact you'll create! If you need any assistance, our support team is here to help.</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} Fundraising Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Application approved email sent to ${user.email}`);
  } catch (error) {
    console.error("❌ Error sending application approved email:", error);
    throw error;
  }
};

/**
 * Send email notification when application is rejected
 * @param {Object} user - User object with email and name
 * @param {Object} application - Application object with details
 * @param {String} rejectionReason - Reason for rejection
 */
export const sendApplicationRejectedEmail = async (user, application, rejectionReason) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Application Update - Additional Information Required",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .warning-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .info-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">Application Status Update</h1>
          </div>
          <div class="content">
            <p style="font-size: 16px;">Dear <strong>${user.name}</strong>,</p>
            
            <p>Thank you for your interest in becoming an organizer on our platform. After careful review of your application for <strong>${application.organizationName}</strong>, we regret to inform you that we are unable to approve it at this time.</p>

            <div class="warning-box">
              <h3 style="margin-top: 0; color: #dc2626;">📋 Reason for Decision</h3>
              <p style="margin: 0; font-size: 15px; white-space: pre-wrap;">${rejectionReason || 'Your application did not meet our current requirements.'}</p>
            </div>

            <div class="info-box">
              <h3 style="margin-top: 0; color: #3b82f6;">🔄 What You Can Do</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li><strong>Review the feedback:</strong> Carefully read the reason provided above</li>
                <li><strong>Address the concerns:</strong> Take time to improve your application based on our feedback</li>
                <li><strong>Reapply:</strong> You're welcome to submit a new application once you've addressed the issues</li>
                <li><strong>Contact support:</strong> If you have questions, reach out to our team for clarification</li>
              </ul>
            </div>

            <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0;"><strong>💡 Tip:</strong> Many successful organizers were initially rejected but improved their applications and were later approved. Don't give up on your mission!</p>
            </div>

            <div class="info-box">
              <h3 style="margin-top: 0; color: #6b7280;">📋 Application Details</h3>
              <p><strong>Organization:</strong> ${application.organizationName}</p>
              <p><strong>Type:</strong> ${application.organizationType}</p>
              <p><strong>Reviewed On:</strong> ${new Date(application.reviewedAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/apply-organizer" class="button">Submit New Application</a>
            </div>

            <p style="margin-top: 30px; text-align: center; color: #6b7280;">We appreciate your understanding and encourage you to reapply when you're ready. Our support team is available if you need guidance.</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} Fundraising Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Application rejected email sent to ${user.email}`);
  } catch (error) {
    console.error("❌ Error sending application rejected email:", error);
    throw error;
  }
};

/**
 * Send email notification when organizer role is revoked
 * @param {Object} user - User object with email and name
 * @param {Object} application - Application object with details
 * @param {String} revokeReason - Reason for revocation
 */
export const sendOrganizerRevokedEmail = async (user, application, revokeReason) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "⚠️ Important: Your Organizer Status Has Been Revoked",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .info-box { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">⚠️ Account Status Update</h1>
          </div>
          <div class="content">
            <p style="font-size: 16px;">Dear <strong>${user.name}</strong>,</p>
            
            <p>We are writing to inform you that your organizer privileges for <strong>${application.organizationName}</strong> have been revoked, and your account has been reverted to donor status.</p>

            <div class="alert-box">
              <h3 style="margin-top: 0; color: #d97706;">📋 Reason for Revocation</h3>
              <p style="margin: 0; font-size: 15px; white-space: pre-wrap;">${revokeReason || 'Your organizer status was revoked due to policy violations or account review.'}</p>
            </div>

            <div class="info-box">
              <h3 style="margin-top: 0; color: #ef4444;">🚫 What This Means</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>You can no longer create new fundraising campaigns</li>
                <li>Your existing campaigns may be affected or removed</li>
                <li>You cannot receive donations as an organizer</li>
                <li>Your account remains active as a donor</li>
              </ul>
            </div>

            <div class="info-box">
              <h3 style="margin-top: 0; color: #3b82f6;">🔄 Next Steps</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li><strong>Review the reason:</strong> Understand why your status was revoked</li>
                <li><strong>Contact support:</strong> If you believe this was a mistake, reach out to our team</li>
                <li><strong>Appeal process:</strong> You may be able to appeal this decision</li>
                <li><strong>Continue as donor:</strong> You can still support campaigns as a donor</li>
              </ul>
            </div>

            <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0;"><strong>⚠️ Important:</strong> If you have any pending campaigns or donations, please contact our support team immediately to discuss the next steps.</p>
            </div>

            <div class="info-box">
              <h3 style="margin-top: 0; color: #6b7280;">📋 Revocation Details</h3>
              <p><strong>Organization:</strong> ${application.organizationName}</p>
              <p><strong>Revoked On:</strong> ${new Date(application.reviewedAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/contact-support" class="button">Contact Support</a>
            </div>

            <p style="margin-top: 30px; text-align: center; color: #6b7280;">We take these decisions seriously and only revoke organizer status when necessary. If you have questions or concerns, please contact our support team.</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>© ${new Date().getFullYear()} Fundraising Platform. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Organizer revoked email sent to ${user.email}`);
  } catch (error) {
    console.error("❌ Error sending organizer revoked email:", error);
    throw error;
  }
};

// Test email configuration
export const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log("✅ Email service is ready to send messages");
    return true;
  } catch (error) {
    console.error("❌ Email service configuration error:", error);
    return false;
  }
};
