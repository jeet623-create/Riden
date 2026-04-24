export const metadata = {
  title: 'RIDEN LINE Bot',
  description: 'RIDEN Thailand — LINE Messaging API service',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
