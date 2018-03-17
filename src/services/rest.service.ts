import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';

@Injectable()
export class RestService {
  public modelName: string;
  protected options: any;

  private serverWithApiUrl: string;

  // cache data
  public lastGetAll: Array<any>;
  public lastGet: any;

  constructor(private http: HttpClient) {
    this.modelName = 'to-configure';

    this.options = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8'
      }),
      withCredentials: true
    };
  }

  public setApiUrl(url: string) {
    this.serverWithApiUrl = url;
  }

  // HELPERS
  public getAllFromLS(maxtime = 0): Array<any> {
    const json = localStorage.getItem('rest_all_' + this.modelName);
    if (json) {
      const obj = JSON.parse(json);
      if (obj && obj.date < Date.now() - maxtime) {
        return obj;
      }
    }
  }

  public getFromCache(id): any {
    if (this.lastGetAll) {
      return this.lastGetAll.find(unit => unit.id === id);
    } else {
      return null;
    }
  }

  private getActionUrl() {
    return this.serverWithApiUrl + this.modelName + '/';
  }

  // REST functions
  public async getAll(): Promise<any[]> {
    return await this.http
      .get(this.getActionUrl(), this.options)
      .toPromise()
      .then(response => {
        // getting an array having the same name as the model
        const data = response[this.modelName];
        // transforming the array from indexed to associative
        const tab = data.records.map(elem => {
          const unit = {};
          // using the columns order and number to rebuild the object
          data.columns.forEach((champ, index) => {
            unit[champ] = elem[index];
          });
          return unit;
        });
        this.lastGetAll = tab;
        const obj = {
          data: tab,
          date: Date.now()
        };
        localStorage.setItem('rest_all_' + this.modelName, JSON.stringify(obj));
        return tab;
      })
      .catch(this.handleError);
  }

  public async get(id: number): Promise<any> {
    return await this.http
      .get(`${this.getActionUrl()}id`, this.options)
      .toPromise()
      .then(response => {
        const data = response;
        this.lastGet = data;
        return data;
      })
      .catch(this.handleError);
  }

  public async add(item: any): Promise<any> {
    return await this.http
      .post<any>(this.getActionUrl(), JSON.stringify(item), this.options)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  }

  public async addAll(tab: Array<number>): Promise<any> {
    return await this.http
      .post(this.getActionUrl(), JSON.stringify(tab), this.options)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  }

  public async update(id: number, itemToUpdate: any): Promise<any> {
    return await this.http
      .put(`${this.getActionUrl()}id`, JSON.stringify(itemToUpdate), this.options)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  }

  public async delete(id: number): Promise<any> {
    return await this.http
      .delete(`${this.getActionUrl()}id`, this.options)
      .toPromise()
      .then(response => response)
      .catch(this.handleError);
  }

  private handleError(error: HttpResponse<any>) {
    console.error(error);
    return Promise.reject(error || 'Server error');
  }
}
