import RecordsPage from "./_components/records-page";

export default function Page() {
  return (
    <div className="mx-10 my-20 text-sm">
      <div>
        <h1 className="text-2xl font-medium">Notification Records</h1>
        <p className="text-xs text-neutral-600">
          View and manage all notification records here.
        </p>
      </div>
      <RecordsPage />
    </div>
  );
}
