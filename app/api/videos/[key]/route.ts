import { NextResponse } from 'next/server';
import qiniu from 'qiniu';

// 七牛云配置
const accessKey = process.env.QINIU_ACCESS_KEY!;
const secretKey = process.env.QINIU_SECRET_KEY!;
const bucket = process.env.QINIU_BUCKET!;
const cdnDomain = process.env.NEXT_PUBLIC_VIDEO_CDN_URL!;

// 创建认证对象
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

// 创建配置对象
const config = new qiniu.conf.Config();
config.zone = qiniu.zone.Zone_z2;  // 华南区域

// 创建存储空间管理对象
const bucketManager = new qiniu.rs.BucketManager(mac, config);

export async function GET(
  request: Request,
  { params }: { params: { key: string } }
) {
  try {
    // 解码 key
    const decodedKey = decodeURIComponent(params.key);
    
    // 获取文件信息
    const result = await new Promise<any>((resolve, reject) => {
      bucketManager.stat(bucket, decodedKey, (err, respBody, respInfo) => {
        if (err) {
          reject(err);
        } else if (respInfo.statusCode === 200) {
          resolve(respBody);
        } else {
          reject(new Error('获取视频信息失败'));
        }
      });
    });

    // 处理视频信息
    const video = {
      key: decodedKey,
      title: decodedKey.split('/').pop()?.split('-').slice(1).join('-').replace(/\.[^/.]+$/, '') || '未命名视频',
      url: `${cdnDomain}/${decodedKey}`,
      createTime: result.putTime / 10000,
      size: result.fsize,
      mimeType: result.mimeType,
    };

    return NextResponse.json({
      success: true,
      video,
    });
  } catch (error) {
    console.error('获取视频信息失败:', error);
    return NextResponse.json(
      { error: '获取视频信息失败' },
      { status: 500 }
    );
  }
} 