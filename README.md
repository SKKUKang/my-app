[프론트엔드코드](https://github.com/SKKUKang/my-app)
react, nextjs 기반

[서버코드](https://github.com/SKKUKang/server)
python 기반, 주요 로직 처리


프론트엔드는 Nextjs와 tailwind를 쓰고 있어 추가로 설치해야할게 많을 수 있습니다.
설치가 정상적으로 완료되었다면 npm run dev 명령어로 localhost:3000 에서 확인할 수 있습니다.

아래는 요청보내는 IP를 127.0.0.1로 해놓고 배포한 프론트엔드 주소입니다.
https://my-app-4nng.vercel.app/

백엔드 코드 다운받으신 뒤 app.py를 실행시킨 상태로 저 링크에 접속하면 확인해보실 수 있습니다.

백엔드 코드의 경우 selenium과 tesseract를 사용하여서 별도로 설치가 필요하거나 크롬드라이버를 맞춰주어야 할 수 있습니다.

일단 폴더 내부에 해당 드라이버들을 상대경로들로 두긴 하였습니다. 감사합니다.


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
