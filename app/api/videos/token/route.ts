import { NextResponse } from 'next/server';
import qiniu from 'qiniu';

// 七牛云配置
const accessKey = process.env.QINIU_ACCESS_KEY!;
const secretKey = process.env.QINIU_SECRET_KEY!;
const bucket = process.env.QINIU_BUCKET!;

export async function GET(request: Request) {
  try {
    // 创建认证对象
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

    // 生成上传凭证
    const putPolicy = new qiniu.rs.PutPolicy({
      scope: bucket,
      expires: 3600, // 1小时有效期
      returnBody: '{"key":"$(key)","hash":"$(etag)","size":$(fsize),"mimeType":"$(mimeType)"}',
    });
    const token = putPolicy.uploadToken(mac);

    return NextResponse.json({
      success: true,
      token,
      domain: process.env.NEXT_PUBLIC_VIDEO_CDN_URL,
    });
  } catch (error) {
    console.error('获取上传凭证失败:', error);
    return NextResponse.json(
      { error: '获取上传凭证失败' },
      { status: 500 }
    );
  }
} 