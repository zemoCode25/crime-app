import nodemailer from 'nodemailer';
import { render } from '@react-email/components';
import { EmailTemplate } from '@/components/utils/EmailTemplate';
import { createInvitation } from '@/server/queries/invitation';
import { createClient } from '@/server/supabase/server';
import { getUser } from '@/server/actions/getUser';
import { BARANGAY_OPTIONS } from '@/constants/crime-case';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const { email, firstName, lastName, role, barangay } = await request.json();

    // Validate user is authenticated
    const activeUser = await getUser();
    if (!activeUser) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create invitation in database
    const supabase = await createClient();
    const { data: invitation, error: invitationError, token } = await createInvitation(
      supabase,
      {
        email,
        first_name: firstName,
        last_name: lastName,
        role,
        barangay,
        created_by_id: activeUser.id,
      }
    );

    if (invitationError || !invitation || !token) {
      return Response.json(
        { error: invitationError?.message || 'Failed to create invitation' },
        { status: 500 }
      );
    }

    // Generate invite link
    const inviteLink = `${process.env.NEXT_PUBLIC_SITE_URL}/signup?token=${token}`;

    // Get barangay name
    const barangayName = BARANGAY_OPTIONS.find(b => b.id === barangay)?.value;

    // Render email template
    const emailHtml = await render(
      EmailTemplate({
        firstName,
        lastName,
        role,
        barangay: barangayName,
        inviteLink
      })
    );

    // Send email via Gmail
    await transporter.sendMail({
      from: `"Muntinlupa Crime Mapping" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Your Muntinlupa System Access Invitation',
      html: emailHtml,
    });

    return Response.json({ success: true, invitationId: invitation.id });
  } catch (error) {
    console.error('Email Error:', error);
    const message = error instanceof Error ? error.message : 'Failed to send invitation';
    return Response.json({ error: message }, { status: 500 });
  }
}