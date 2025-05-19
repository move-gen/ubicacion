import SacarFoto from "../SacarFoto";
export default function SacarFotoStep({ foto, updateState }) {
  return (
    <div className="flex flex-col items-center justify-center my-4 border bg-secondary text-primary rounded-md p-6 w-full md:w-2/3 lg:w-1/2 mx-auto">
      <SacarFoto foto={foto} updateState={updateState} />
    </div>
  );
}
