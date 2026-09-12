import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Linkedin } from "lucide-react";

export default function Footer() {
  // get the current time in WIB (UTC+7 - Indramayu, Indonesia)
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const interval = setInterval(() => {
      const date = new Date();
      date.setHours(date.getHours());
      setTime(
        date.toLocaleTimeString("en-US", {
          hour12: true,
          hour: "numeric",
          minute: "numeric",
          timeZone: "Asia/Jakarta",
        }),
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="w-full bg-gradient-to-t from-primary/[1%] to-transparent">
      <div className="container mx-auto flex flex-row items-center justify-between py-6">
        <span className="flex flex-row items-center space-x-4">
          <p className="text-xs text-muted-foreground">
            Made by{" "}
            <Link
              href="https://www.linkedin.com/in/zulfa-adzin-kautsar-b9b0723b2"
              target="_blank"
              passHref
              className="text-foreground transition hover:text-primary"
            >
              Zulfa Adzin Kautsar
            </Link>
          </p>
          <hr className="hidden h-6 border-l border-muted md:flex" />
          <span className="flex hidden flex-row items-center space-x-2 md:flex">
            <p className="text-xs text-muted-foreground">Local time:</p>
            <p className="text-sm font-semibold">{time} WIB</p>
          </span>
        </span>
        <Link
          href="https://www.linkedin.com/in/zulfa-adzin-kautsar-b9b0723b2"
          target="_blank"
          passHref
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          <Button variant={"outline"}>
            <Linkedin className="h-4 w-4 md:mr-2" />
            <span className="hidden md:flex">LinkedIn</span>
          </Button>
        </Link>
      </div>
      <div className="h-1 bg-[radial-gradient(closest-side,#8486ff,#42357d,#5d83ff,transparent)] opacity-50" />
    </footer>
  );
}
