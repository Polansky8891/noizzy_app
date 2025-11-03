import BackButton from "./BackButton";

export default function BackHeader({ className = "" }) {
  return (
    <div className={["pt-1 px-4", className].join(" ")}>
      <BackButton
        className="-ml-1 -mt-0.5"
        iconClassName="text-[#0A84FF]"
        size={22}
      />
    </div>
  );
}
