import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Faroe and Next.js basic example"
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
