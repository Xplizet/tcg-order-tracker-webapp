"""
Email Service using Resend
"""
import os
import resend
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Initialize Resend with API key from environment
resend.api_key = os.getenv("RESEND_API_KEY")
FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev")


def send_test_email(to_email: str) -> dict:
    """
    Send a test email to verify Resend integration
    """
    try:
        params = {
            "from": FROM_EMAIL,
            "to": [to_email],
            "subject": "TCG Preorder Tracker - Test Email",
            "html": """
                <h1>Test Email Successful!</h1>
                <p>Your TCG Preorder Tracker email notifications are working correctly.</p>
                <p>You will receive:</p>
                <ul>
                    <li>Release reminders for upcoming preorders</li>
                    <li>Payment reminders for outstanding balances</li>
                    <li>Weekly or monthly digest emails (based on your preferences)</li>
                </ul>
                <p>You can manage your notification preferences in the Settings page.</p>
                <hr>
                <p style="color: gray; font-size: 12px;">
                    This is an automated test email from TCG Preorder Tracker.
                </p>
            """
        }

        response = resend.Emails.send(params)
        logger.info(f"Test email sent to {to_email}, ID: {response.get('id')}")
        return {"success": True, "email_id": response.get('id')}

    except Exception as e:
        logger.error(f"Failed to send test email: {str(e)}")
        raise Exception(f"Failed to send email: {str(e)}")


def send_release_reminder(
    to_email: str,
    product_name: str,
    store_name: str,
    release_date: str,
    days_until: int
) -> dict:
    """
    Send a release reminder email
    """
    try:
        params = {
            "from": FROM_EMAIL,
            "to": [to_email],
            "subject": f"Reminder: {product_name} releases in {days_until} day(s)",
            "html": f"""
                <h1>Release Reminder</h1>
                <p>Your preorder is releasing soon!</p>

                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="margin-top: 0;">{product_name}</h2>
                    <p><strong>Store:</strong> {store_name}</p>
                    <p><strong>Release Date:</strong> {release_date}</p>
                    <p><strong>Days Until Release:</strong> {days_until}</p>
                </div>

                <p>Make sure you're prepared for the release!</p>

                <hr>
                <p style="color: gray; font-size: 12px;">
                    You received this email because you have release reminders enabled in TCG Preorder Tracker.
                    <br>Manage your preferences in Settings.
                </p>
            """
        }

        response = resend.Emails.send(params)
        logger.info(f"Release reminder sent to {to_email}, ID: {response.get('id')}")
        return {"success": True, "email_id": response.get('id')}

    except Exception as e:
        logger.error(f"Failed to send release reminder: {str(e)}")
        raise Exception(f"Failed to send email: {str(e)}")


def send_payment_reminder(
    to_email: str,
    total_owing: float,
    preorder_count: int
) -> dict:
    """
    Send a payment reminder email for outstanding balances
    """
    try:
        params = {
            "from": FROM_EMAIL,
            "to": [to_email],
            "subject": f"Payment Reminder: ${total_owing:.2f} owing on {preorder_count} preorder(s)",
            "html": f"""
                <h1>Payment Reminder</h1>
                <p>You have outstanding balances on your preorders.</p>

                <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="margin-top: 0; color: #92400e;">Total Amount Owing</h2>
                    <p style="font-size: 32px; font-weight: bold; color: #92400e; margin: 10px 0;">
                        ${total_owing:.2f}
                    </p>
                    <p><strong>Number of Preorders:</strong> {preorder_count}</p>
                </div>

                <p>Log in to TCG Preorder Tracker to view details and update your payments.</p>

                <hr>
                <p style="color: gray; font-size: 12px;">
                    You received this email because you have payment reminders enabled in TCG Preorder Tracker.
                    <br>Manage your preferences in Settings.
                </p>
            """
        }

        response = resend.Emails.send(params)
        logger.info(f"Payment reminder sent to {to_email}, ID: {response.get('id')}")
        return {"success": True, "email_id": response.get('id')}

    except Exception as e:
        logger.error(f"Failed to send payment reminder: {str(e)}")
        raise Exception(f"Failed to send email: {str(e)}")


def send_weekly_digest(
    to_email: str,
    total_preorders: int,
    pending_count: int,
    delivered_count: int,
    total_owing: float
) -> dict:
    """
    Send a weekly digest email
    """
    try:
        params = {
            "from": FROM_EMAIL,
            "to": [to_email],
            "subject": "TCG Preorder Tracker - Weekly Digest",
            "html": f"""
                <h1>Your Weekly Preorder Digest</h1>
                <p>Here's a summary of your preorders this week:</p>

                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="margin-top: 0;">Summary</h2>
                    <p><strong>Total Preorders:</strong> {total_preorders}</p>
                    <p><strong>Pending:</strong> {pending_count}</p>
                    <p><strong>Delivered:</strong> {delivered_count}</p>
                    <p><strong>Total Owing:</strong> ${total_owing:.2f}</p>
                </div>

                <p>Log in to TCG Preorder Tracker to see more details.</p>

                <hr>
                <p style="color: gray; font-size: 12px;">
                    You received this email because you have weekly digests enabled in TCG Preorder Tracker.
                    <br>Manage your preferences in Settings.
                </p>
            """
        }

        response = resend.Emails.send(params)
        logger.info(f"Weekly digest sent to {to_email}, ID: {response.get('id')}")
        return {"success": True, "email_id": response.get('id')}

    except Exception as e:
        logger.error(f"Failed to send weekly digest: {str(e)}")
        raise Exception(f"Failed to send email: {str(e)}")


def send_monthly_digest(
    to_email: str,
    total_preorders: int,
    total_spent: float,
    total_profit: float,
    sold_count: int
) -> dict:
    """
    Send a monthly digest email
    """
    try:
        params = {
            "from": FROM_EMAIL,
            "to": [to_email],
            "subject": "TCG Preorder Tracker - Monthly Report",
            "html": f"""
                <h1>Your Monthly Preorder Report</h1>
                <p>Here's a summary of your preorder activity this month:</p>

                <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="margin-top: 0;">Monthly Summary</h2>
                    <p><strong>Total Preorders:</strong> {total_preorders}</p>
                    <p><strong>Total Spent:</strong> ${total_spent:.2f}</p>
                    <p><strong>Items Sold:</strong> {sold_count}</p>
                    <p><strong>Total Profit:</strong> <span style="color: {'green' if total_profit >= 0 else 'red'};">${total_profit:.2f}</span></p>
                </div>

                <p>Log in to TCG Preorder Tracker to see detailed analytics and charts.</p>

                <hr>
                <p style="color: gray; font-size: 12px;">
                    You received this email because you have monthly reports enabled in TCG Preorder Tracker.
                    <br>Manage your preferences in Settings.
                </p>
            """
        }

        response = resend.Emails.send(params)
        logger.info(f"Monthly digest sent to {to_email}, ID: {response.get('id')}")
        return {"success": True, "email_id": response.get('id')}

    except Exception as e:
        logger.error(f"Failed to send monthly digest: {str(e)}")
        raise Exception(f"Failed to send email: {str(e)}")
