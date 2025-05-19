import { Input } from "@/components/ui/input";
import { Ban, CircleCheck } from "lucide-react";

export default function Seguro({ seguro }) {
  return (
    <>
      <Input
        type="text"
        name="seguro"
        className={`font-medium pl-10 border ${
          seguro !== "NO MOVER" && seguro
            ? "border-green-500"
            : "border-red-500"
        }`}
        readOnly
        placeholder={seguro}
      />

      {seguro !== "NO MOVER" && seguro ? (
        <CircleCheck
          color="green"
          className="absolute left-2 top-1/2 transform -translate-y-1/2"
        />
      ) : (
        <Ban
          color="red"
          className="absolute left-2 top-1/2 transform -translate-y-1/2"
        />
      )}
    </>
  );
}
