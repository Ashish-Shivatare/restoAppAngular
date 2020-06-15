import { Injectable } from "@angular/core";
import { Promotion } from "../shared/promotion";
import { PROMOTIONS } from "../shared/promotions";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { ProcessHTTPMsgService } from "./process-httpmsg.service";
import { baseURL } from "../shared/baseurl";

@Injectable({
  providedIn: "root",
})
export class PromotionService {
  constructor(
    private http: HttpClient,
    private processHTTPMsgService: ProcessHTTPMsgService
  ) {}

  getPromotions(): Observable<Promotion[]> {
    return this.http
      .get<Promotion[]>(baseURL + "promotions")
      .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  getPromotion(id: number): Observable<Promotion> {
    return this.http
      .get<Promotion>(baseURL + "promotions/" + id)
      .pipe(catchError(this.processHTTPMsgService.handleError));
  }

  getFeaturedPromotion(): Observable<Promotion> {
    return this.http
      .get<Promotion[]>(baseURL + "promotions?featured=true")
      .pipe(map((promotions) => promotions[0]))
      .pipe(catchError(this.processHTTPMsgService.handleError));
  }
}
