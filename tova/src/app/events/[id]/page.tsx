import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import { notFound } from "next/navigation";
import EventDetailsClient from "./event-details";
import { getCurrentUser, getEventDetail } from "@/app/actions";

export const revalidate = 0;

export default async function EventDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = await paramsPromise;

  if (!params || !params.id) {
    console.error("Params or ID is undefined", params);
    notFound();
  }

  const { id } = params;

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const detail = await getEventDetail(id);
  if (!detail) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <EventDetailsClient event={detail.event} guests={detail.guests} />
    </>
  );
}
