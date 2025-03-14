import { Component, Input, OnInit } from "@angular/core";
import { trigger, transition, useAnimation } from "@angular/animations";
import { CarImage } from "./carousel.interface";
import { AnimationType, fadeIn, fadeOut } from "./carousel.animations";

@Component({
    selector: "app-carousel",
    templateUrl: "./carousel.component.html",
    styleUrls: ["./carousel.component.scss"],
    animations: [
        trigger("slideAnimation", [
            /* fade */
            transition("void => fade", [
                useAnimation(fadeIn, { params: { time: "500ms" } })
            ]),
            transition("fade => void", [
                useAnimation(fadeOut, { params: { time: "500ms" } })
            ])
        ])
    ]
})
export class CarouselComponent implements OnInit {
    @Input() cars: CarImage[] = [];
    animationType = AnimationType.Fade;

    currentSlide = 0;

    onPreviousClick() {
        const previous = this.currentSlide - 1;
        this.currentSlide = previous < 0 ? this.cars.length - 1 : previous;
        console.log("previous clicked, new current slide is: ", this.currentSlide);
    }

    onNextClick() {
        const next = this.currentSlide + 1;
        this.currentSlide = next === this.cars.length ? 0 : next;
        console.log("next clicked, new current slide is: ", this.currentSlide);
    }

    ngOnInit() {
        this.preloadImages(); // for the demo
    }

    preloadImages() {
        for (const car of this.cars) {
            new Image().src = car.image;
        }
    }
}
