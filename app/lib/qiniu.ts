import qiniu from 'qiniu';
import * as qiniujs from 'qiniu-js';

// 七牛云配置
const accessKey = process.env.QINIU_ACCESS_KEY!;
const secretKey = process.env.QINIU_SECRET_KEY!;
const bucket = process.env.QINIU_BUCKET!;
const cdnDomain = process.env.NEXT_PUBLIC_VIDEO_CDN_URL!;

// 创建认证对象
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

// 创建配置对象
const config = new qiniu.conf.Config();
// 华南区域 z2
config.zone = qiniu.zone.Zone_z2;

// 创建存储空间管理对象
const bucketManager = new qiniu.rs.BucketManager(mac, config);

// 获取上传凭证
function getUploadToken(key: string): string {
  const putPolicy = new qiniu.rs.PutPolicy({
    scope: `${bucket}:${key}`,
    expires: 3600, // 1小时有效期
  });
  return putPolicy.uploadToken(mac);
}

// 上传视频文件
export async function uploadVideo(file: File): Promise<string> {
  try {
    const key = `videos/${Date.now()}-${file.name}`;
    const token = getUploadToken(key);

    const observable = qiniujs.upload(file, key, token, {}, {
      useCdnDomain: true,
    });

    return new Promise((resolve, reject) => {
      observable.subscribe({
        next(res) {
          console.log('上传进度:', res.total.percent);
        },
        error(err) {
          reject(err);
        },
        complete(res) {
          const url = `${cdnDomain}/${res.key}`;
          resolve(url);
        },
      });
    });
  } catch (error) {
    console.error('上传视频失败:', error);
    throw error;
  }
}

// 获取视频文件的访问 URL
export function getVideoUrl(key: string): string {
  return `${cdnDomain}/${key}`;
}

// 删除视频文件
export function deleteVideo(key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    bucketManager.delete(bucket, key, (err) => {
      if (err) {
        console.error('删除视频失败:', err);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// 获取视频列表
export function listVideos(prefix = 'videos/'): Promise<qiniu.rs.ListItem[]> {
  return new Promise((resolve, reject) => {
    bucketManager.listPrefix(bucket, {
      prefix,
      limit: 1000,
    }, (err, respBody, respInfo) => {
      if (err) {
        console.error('获取视频列表失败:', err);
        reject(err);
      } else if (respInfo.statusCode === 200) {
        resolve(respBody.items);
      } else {
        reject(new Error('获取视频列表失败'));
      }
    });
  });
} 