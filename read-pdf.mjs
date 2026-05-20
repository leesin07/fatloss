import { FetchClient, Config } from 'coze-coding-dev-sdk';

const pdfUrl = 'https://coze-coding-project.tos.coze.site/create_attachment/2026-05-20/1655211048335483_0782e1eb357221a28e0d8b702058ef57_%E5%87%8F%E8%84%82%E8%AE%A1%E7%AE%97%E5%99%A8%E4%BA%A7%E5%93%81%E6%A1%86%E6%9E%B6-2026%E5%B9%B405%E6%9C%8820%E6%97%A5-%E6%9D%A5%E8%87%AA%E3%80%90Get%20%E7%AC%94%E8%AE%B0%E3%80%91.pdf?sign=4901327519-cebdda4f0e-0-8af30d86f8a461c9c56ad4d5cb6113b0593f813046bd547d4bbdfacd05d24ffe';

async function main() {
  const config = new Config();
  const client = new FetchClient(config);
  
  console.log('正在读取PDF...');
  const response = await client.fetch(pdfUrl);
  
  console.log('\n=== PDF 内容 ===\n');
  console.log('标题:', response.title);
  console.log('文件类型:', response.filetype);
  console.log('\n内容:\n');
  
  for (const item of response.content) {
    if (item.type === 'text') {
      console.log(item.text);
    }
  }
}

main().catch(console.error);
