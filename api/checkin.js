// ไฟล์: api/checkin.js (เวอร์ชันส่งอีเมลแจ้งเตือนเมื่อมีคนเช็คอิน)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'ต้องส่ง POST เท่านั้น' });
  }

  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ success: false, message: 'ไม่พบหมายเลขกระเป๋าเงิน' });
  }

  try {
    // 📨 1. คำสั่งยิงอีเมลแจ้งเตือนเข้าเมลของคุณพี่ด้วยบริการ Resend อัตโนมัติ
    // (เราจะส่งข้อความแจ้งเตือนไปที่อีเมลของคุณพี่โดยตรง)
    await fetch('https://resend.com', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, // รหัสลับบริการส่งเมล
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'RewardsApp <onboarding@resend.dev>',
        to: process.env.MY_EMAIL, // 📍 อีเมลของคุณพี่ที่ระบบจะส่งไปแจ้งเตือน
        subject: '🔔 มีคนมากดเช็คอินรับแต้มแล้วครับคุณพี่!',
        html: `
          <h3>🎉 รายงานกิจกรรมจากแอป TokenRewards</h3>
          <p><b>หมายเลขกระเป๋า BNB:</b> ${walletAddress}</p>
          <p><b>กิจกรรม:</b> กดรับแต้มเช็คอินคอมโบสำเร็จ (+10 แต้ม)</p>
          <p>วันเวลา: ${new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}</p>
        `,
      }),
    });

    // 2. ตอบกลับหน้าบ้านตามปกติ
    return res.status(200).json({
      success: true,
      message: `บันทึกแต้มให้กระเป๋า ${walletAddress} สำเร็จ! (+10 แต้ม)`
    });

  } catch (error) {
    console.error('Email error:', error);
    // แม้ระบบส่งเมลจะติดขัด แต่เรายังให้ผู้ใช้เช็คอินผ่าน เพื่อไม่ให้แอปสะดุดครับ
    return res.status(200).json({ success: true, message: `บันทึกแต้มสำเร็จ! (+10 แต้ม)` });
  }
}
