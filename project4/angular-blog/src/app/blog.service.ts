import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

export class Post {
  postid: number;
  created: Date;
  modified: Date;
  title: string;
  body: string;
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  draft: Post;

  savedPosts: number[];

  save_callback = null;

  delete_callback = null;

  private url = '/api/';

  constructor(private http: HttpClient){}

  saveSubscribe(callback) { this.save_callback = callback; }

  deleteSubscribe(callback) { this.delete_callback = callback; }

  fetchPosts(username: string): Observable<Post[]> {
    return this.http.get<Post[]>(this.url + username)
    .pipe(
      catchError(this.handleError<Post[]>('fetchPosts', []))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
  
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead
  
      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);
  
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  getPost(username: string, postid: number): Observable<Post>{
    //console.log("POST ID " + postid);
    return this.http.get<Post>(this.url + username + '/' + postid.toString()).pipe(
      catchError(this.handleError<Post>('getPost'))
    );
    
  }

  newPost(username: string, post: Post): Observable<void> {
    //console.log(JSON.stringify(post));
    return this.http.post<void>(this.url + username + '/' + post.postid.toString(),post,httpOptions).pipe(
      catchError(this.handleError<void>('newPost'))
    );
  }

  updatePost(username: string, post: Post): Observable<void> {
    return this.http.put<void>(this.url + username + '/' + post.postid.toString(),post).pipe(
      catchError(this.handleError<void>('newPost'))
    );
  }

  deletePost(username: string, postid: number): Observable<void> {
    return this.http.delete<void>(this.url + username + '/' + postid.toString()).pipe(
      catchError(this.handleError<void>('newPost'))
    );
  }

  setCurrentDraft(post: Post): void {
    this.draft = post;
  }

  getCurrentDraft(): Post {
    return this.draft;
  }

  setSavedPosts(savedPosts: number[]): void {
    this.savedPosts = savedPosts;
  }

  getSavedPosts(): number[] {
    return this.savedPosts;
  }

  runSaveCallback(post: Post): void {
    this.save_callback(post);
  }

  runDeleteCallback(postid: number): void {
    this.delete_callback(postid);
  }

}
