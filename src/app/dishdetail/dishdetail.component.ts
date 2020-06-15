import { Component, Input, OnInit, Inject } from "@angular/core";
import { Dish } from "../shared/dish";
import { DishService } from "../services/dish.service";
import { Params, ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import { switchMap } from "rxjs/operators";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Comment } from "../shared/comment";
import { visibility, flyInOut, expand } from "../animations/app.animation";

@Component({
  selector: "app-dishdetail",
  templateUrl: "./dishdetail.component.html",
  styleUrls: ["./dishdetail.component.scss"],
  host: {
    "[@flyInOut]": "true",
    style: "display: block;",
  },
  animations: [flyInOut(), visibility(), expand()],
})
export class DishdetailComponent implements OnInit {
  @Input()
  dish: Dish;
  errMess: string;
  dishIds: string[];
  prev: string;
  next: string;
  commentForm: FormGroup;
  newComment: Comment;
  dishcopy: Dish;
  visibility = "shown";

  formErrors = {
    author: "",
    comment: "",
  };

  validationMessages = {
    author: {
      required: "Name is required.",
      minlength: "Name must be at least 2 characters long.",
      maxlength: "Name cannot be more than 25 characters long.",
    },
    comment: {
      required: "Comment is required.",
    },
  };

  constructor(
    private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    @Inject("BaseURL") public BaseURL
  ) {
    this.createForm();
  }

  createForm(): void {
    this.commentForm = this.fb.group({
      rating: 5,
      comment: ["", [Validators.required]],
      author: [
        "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(25),
        ],
      ],
    });
    this.commentForm.valueChanges.subscribe((data) =>
      this.onValueChanged(data)
    );
  }

  onSubmit() {
    this.newComment = this.commentForm.value;
    this.newComment.date = new Date().toISOString();
    console.log(this.newComment);
    this.dish.comments.push(this.newComment);
    this.dishservice.putDish(this.dishcopy).subscribe(
      (dish) => {
        this.dish = dish;
        this.dishcopy = dish;
      },
      (errmess) => {
        this.dish = null;
        this.dishcopy = null;
        this.errMess = <any>errmess;
      }
    );
    this.commentForm.reset({
      author: "",
      rating: 5,
      comment: "",
    });
  }

  onValueChanged(data?: any) {
    if (!this.commentForm) {
      return;
    }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = "";
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + " ";
            }
          }
        }
      }
    }
  }

  ngOnInit() {
    this.dishservice
      .getDishIds()
      .subscribe((dishIds) => (this.dishIds = dishIds));
    this.route.params
      .pipe(
        switchMap((params: Params) => {
          this.visibility = "hidden";
          return this.dishservice.getDish(+params["id"]);
        })
      )
      .subscribe(
        (dish) => {
          this.dish = dish;
          this.dishcopy = dish;
          this.setPrevNext(dish.id);
          this.visibility = "shown";
        },
        (errmess) => (this.errMess = <any>errmess)
      );
  }

  goBack(): void {
    this.location.back();
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[
      (this.dishIds.length + index - 1) % this.dishIds.length
    ];
    this.next = this.dishIds[
      (this.dishIds.length + index + 1) % this.dishIds.length
    ];
  }
}
