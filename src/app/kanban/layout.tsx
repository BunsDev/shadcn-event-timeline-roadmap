export default function KanbanLayout({
                                       children,
                                     }: Readonly<{
  children: React.ReactNode;
}>) {
  return <main>{children}</main>;
}
