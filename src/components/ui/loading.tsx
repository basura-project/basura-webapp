import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import Image from "next/image";

const red = "text-primary-foreground";
const blue = "text-foreground";

export default function Loading({ className, variant, ...props }: any) {
  let [unmount, setUnmountd] = React.useState<boolean>(false);
  let { loaded } = props;
  React.useEffect(() => {
    window.addEventListener("beforeunload", t);

    return () => {
      setTimeout(() => {
        window.removeEventListener("beforeunload", t);
        setUnmountd(true);
      }, 100);
    };
  }, []);

  function t() {
    setUnmountd(true);
  }

  const red = "position: absolute;";

  return (
    <div>
      {/* loading {loaded ? "red" : "blue"} */}
      {!loaded && <div className="loader"></div>}
      <Image
        src="/logo-icon.svg"
        width={42}
        height={42}
        alt="Basura Logo"
        className="block dark:hidden"
        style={
          !loaded
            ? {
                position: "absolute",
                left: "calc(50% - 21px)",
                top: "calc(50% - 21px)",
                transition: "0.2s",
              }
            : {
                position: "absolute",
                left: "11.5px",
                top: "16px",
                width: "32px",
                transition: "0.2s",
              }
        }
      />
    </div>
  );
}
