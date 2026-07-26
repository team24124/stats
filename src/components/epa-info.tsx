import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

function EPAInfo() {
  return (
    <Accordion
      type="single"
      collapsible
      className="max-w-lg"
    >
      <AccordionItem value="EPA">
        <AccordionTrigger className="text-[18px]">What is EPA?</AccordionTrigger>
        <AccordionContent className="text-[16px]">
            EPA stands for Expected Points Added. It is the amount of points an individual team is expected to contribute in a match.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="Use">
        <AccordionTrigger className="text-[18px]">How do we use EPA?</AccordionTrigger>
        <AccordionContent className="text-[16px]">
            The EPA model was originally developed by <a href='https://www.statbotics.io/blog/intro'>Statbotics</a> for use in FIRST Robotics Competition (FRC). Nighthawks Robotics is in the process of adapting the model into a predictive measure for FIRST Tech Challenge teams.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default EPAInfo;