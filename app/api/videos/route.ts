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

export async function GET() {
  try {
    // 获取视频列表
    const result = await new Promise<any>((resolve, reject) => {
      bucketManager.listPrefix(bucket, {
        prefix: 'videos/',
        limit: 1000,
      }, (err, respBody, respInfo) => {
        if (err) {
          reject(err);
        } else if (respInfo.statusCode === 200) {
          resolve(respBody);
        } else {
          reject(new Error('获取视频列表失败'));
        }
      });
    });

    // 处理视频列表数据
    const videos = result.items?.map((item: any) => ({
      key: item.key,
      title: item.key.split('/').pop()?.split('-').slice(1).join('-').replace(/\.[^/.]+$/, '') || '未命名视频',
      url: `${cdnDomain}/${item.key}`,
      createTime: item.putTime / 10000, // 七牛云时间戳需要除以 10000
      size: item.fsize,
      mimeType: item.mimeType,
    })) || [];

    // 按上传时间倒序排序
    videos.sort((a: any, b: any) => b.createTime - a.createTime);

    return NextResponse.json({
      success: true,
      videos,
    });
  } catch (error) {
    console.error('获取视频列表失败:', error);
    return NextResponse.json(
      { error: '获取视频列表失败' },
      { status: 500 }
    );
  }
} 