import RoomsSidebar from "./_components/RoomsSidebar";

export default function RoomsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex -mx-5 -my-5 h-[calc(100%+40px)]">
      <RoomsSidebar />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}