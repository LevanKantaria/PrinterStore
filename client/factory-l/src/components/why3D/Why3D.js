import React from "react";
import classes from "./Why3D.module.css";
import ListItem from "../listItem/ListItem";
export const Why3D = () => {
  return (
    <div className={classes.wrapper}>
      <h2>Why 3D Printing?</h2>
      <div className={classes.sectionsDiv}>
        <ListItem
          image="https://i.ibb.co/FYMxZGN/3d-Pirnter-drawing.webp"
          width="200"
          height="200"
          text=" Don't waste time putting products together! Rely on 3D printing to
            make complex geometries that can be printed as one piece—or
            consolidated in one build."
          title="Reduce Assembly Time"
        />
        <ListItem
          image="https://i.ibb.co/FYMxZGN/3d-Pirnter-drawing.webp"
          width="225"
          height="200"
          text=" Working on a project for a customer that has to be just right? Get
          models back fast, and 3D print new iterations, if needed, for final
          feedback and production."
          title="Fast Turnaround"
        />

        <ListItem
          image="https://i.ibb.co/GQCMt39/badge-drawing.webp"
          width="200"
          height="200"
          text="Proprietary processes, expert 3D printing operators, and inspections
          are our secrets to delivering exceptional, quality products every
          time."
          title="Reliable Quality"
        />
      </div>
    </div>
  );
};

export default Why3D;
