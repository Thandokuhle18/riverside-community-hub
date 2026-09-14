import { Link } from "react-router-dom";

const programmes = [
  { name: "Youth Programmes", blurb: "After-school activities and mentorship for young people in the community." },
  { name: "Community Gym", blurb: "A small gym open to members for regular training." },
  { name: "Meeting & Event Rooms", blurb: "Rooms available to book for meetings, workshops and events." },
  { name: "Food-Parcel Donation Drive", blurb: "A community drive providing food parcels to families in need." },
];

export function Landing() {
  return (
    <div>
      <header className="px-8 py-16 max-w-2xl">
        <h1 className="font-display text-5xl leading-tight text-walnut">
          A place to gather, grow, and give back.
        </h1>
        <p className="mt-6 text-walnut/70">
          Riverside Community Hub offers youth programmes, a gym, bookable meeting and
          event rooms, and a food-parcel donation drive for our neighbourhood.
        </p>
        <div className="mt-8 flex gap-4">
          <Link to="/signup" className="px-6 py-3 bg-lavender text-white rounded-[4px_16px_4px_16px]">
            Become a member
          </Link>
          <Link to="/facilities" className="px-6 py-3 border border-lavender/40 text-walnut rounded-[4px_16px_4px_16px]">
            See facilities
          </Link>
        </div>
      </header>

      <section className="px-8 py-12">
        <h2 className="font-display text-3xl mb-8">What happens here</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {programmes.map((p) => (
            <div key={p.name} className="bg-white/60 p-6 border border-wheat/40 rounded-[6px_18px_6px_18px]">
              <h3 className="font-display text-lg text-walnut">{p.name}</h3>
              <p className="mt-2 text-sm text-walnut/70">{p.blurb}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}