import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>¿Necesitas ayuda?</AccordionTrigger>
        <AccordionContent>
          Pulsa en{" "}
          <a
            href="/pdf/Manual.pdf"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            más información
          </a>{" "}
          para conocer como funciona este apartado y configurar la impresora.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
