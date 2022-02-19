import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { env } from 'process';
import { mergeMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { TokenStorageServiceService } from '../../../auth/login/token-storage-service.service';
import * as moment from 'moment';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})

export class CommonHttpService {
  header:any;
  sheader:any;
  constructor(private http: HttpClient,private tokenStorage: TokenStorageServiceService) { }
  getStayIndependentQuestions(){
    this.getHeaders();
    return this.http.get(`${environment.apiUrlNew}/questions/stay/`,{headers:this.header})
  }  
  updateCaregiverStatus(data:any){
    this.getHeaders();
    return this.http.put(`${environment.apiUrlNew}/caregivers/last-active/`,data,{headers:this.header})
  }
  forgetPassword(postData:any){
    this.getSHeader();
    return this.http.put(`${environment.apiUrlNew}/users/forgetPassword/`,postData,{headers:this.sheader})
  }
  updatePassword(postData:any){
    this.getSHeader();
    return this.http.put(`${environment.apiUrlNew}/users/password/`,postData,{headers:this.sheader})
  }
  storeLoginDetails(userLogindetails:any){
    this.getHeaders();
    return this.http.post(`${environment.apiUrlNew}/users/storeLoginDetails/`,userLogindetails,{headers:this.header})
  }
  getSHeader(){
    let accessToken='ODkxZmQ1MzExMGVjYWU3ZTA3ZTkzYWMz7777MmI2NmYxMGE1OWIxYjBmYTNiYzg4MDRkNTMzYjA1ODU1NWM4ZDhlNDEyZDU3NjQxNDBkMjdkOWEwZTIzMzNjMzFhMGU5ODlmYjcwZTkwMGY2N2Y2YzA0ZDc3NmY3M2IwZDc4YmQ5N2YxNjQxNTQ4MjY0';
    this.sheader = new HttpHeaders().set(
      "x-access-token",
      accessToken
    );
  }
 

  getUserDetails(){
    this.getSHeader();
    return this.http.get(`${environment.apiUrlNew}/users/get/`,{headers:this.sheader})
  }

  getNotifications(){
    this.getHeaders();
    return this.http.get(`${environment.apiUrlNew}/notifications/get`,{headers:this.header})
  }
  getAllAlerts(){
    this.getHeaders();
    return this.http.get(`${environment.apiUrlNew}/alerts/get`,{headers:this.header})
  }
  getDowntonQuestions(){
    this.getHeaders();
    return this.http.get(`${environment.apiUrlNew}/questions/downton/`,{headers:this.header})
  }
  
  getQuestionnaireDetails(){
    this.getHeaders();
    return this.http.get(`${environment.apiUrlNew}/questionnaire/get/`,{headers:this.header})
  }
  getNursingQuestionnaireDetails(){
    this.getHeaders();
    return this.http.get(`${environment.apiUrlNew}/nursing/getQuestionnaries/`,{headers:this.header})
  }
  getInterventionSummary(caregiverId:string){
    this.getHeaders();
    return this.http.get(`${environment.apiUrlNew}/nursing/questionaries/getIntervenSummary/?caregiverId=`+caregiverId,{headers:this.header})
  }
  getActiveAnalysis(){
    this.getHeaders();
    return this.http.get(`${environment.apiUrlNew}/rdata/activity-analysis/`,{headers:this.header})
  }
  getPhysioTestData(){
    this.getHeaders();
    return this.http.get(`${environment.apiUrlNew}/physio/get/`,{headers:this.header})
  }
  getRoomDetails(){
    this.getHeaders();
    return this.http.get(`${environment.apiUrlNew}/rooms/get/`,{headers:this.header})
  }
  getWearableDetails(){
    this.getHeaders();
    return this.http.get(`${environment.apiUrlNew}/wearables/get/`,{headers:this.header})
  }
  getPreExsitingQuestions(){
    this.getHeaders();
    return this.http.get(`${environment.apiUrlNew}/questions/pre/`,{headers:this.header})
  }
  getActivityFeedSixHoursData(user_id:string){
    this.getHeaders();
    return this.http.get(`${environment.apiUrlNew}/ddata/SixHours/?resident_id=`+user_id,{headers:this.header})
  }
  getActivityFeedTwoFourHoursData(user_id:string){
    this.getHeaders();
    return this.http.get(`${environment.apiUrlNew}/ddata/TwoFourHours/?resident_id=`+user_id,{headers:this.header})
  }
  getActivityFeedTwelveHoursData(user_id:string){
    this.getHeaders();
    return this.http.get(`${environment.apiUrlNew}/ddata/TwelveHours/?resident_id=`+user_id,{headers:this.header})
  }
  getActivityFeedSevenDaysData(user_id:string){
    this.getHeaders();
    return this.http.get(`${environment.apiUrlNew}/ddata/SevenDays/?resident_id=`+user_id,{headers:this.header})
  }
  getResidentSummaryDetails(user_id:string){
    this.getHeaders();
    return this.http.get(`${environment.apiUrlNew}/nursing/summary/?resident_id=`+user_id,{headers:this.header})
  }
  getInterven(id:any){
    this.getHeaders();
    return this.http.get(`${environment.apiUrlNew}/nursing/questionaries/getIntervenHistory?questionarieId=`+id,{headers:this.header})
  }
  getActivityReports(){
    this.getHeaders();
    return this.http.get(`${environment.apiUrlNew}/rdata/activity-reports/`,{headers:this.header})
  }
  getRiskReports(){
    this.getHeaders();
    return this.http.get(`${environment.apiUrlNew}/rdata/risk-reports/`,{headers:this.header})
  }
  getAllResidentDetails(){
    this.getHeaders();
    return this.http.get(`${environment.apiUrlNew}/residents/get/`,{headers:this.header})
  }
  getAllAlertsDetails(){
    this.getHeaders()
    return this.http.get(`${environment.apiUrlNew}/alerts/get/`,{headers:this.header})
  }
  getResidentDetails(caregiverId:string){
    return this.http.get(`${environment.apiUrlNew}/residents/getResidentsData/?caregiverId=`+caregiverId,{headers:this.header})
  }
  getNursingResiData(caregiverId:string){
    this.getHeaders()
    return this.http.get(`${environment.apiUrlNew}/nursing/getResidentsData/?caregiverId=`+caregiverId,{headers:this.header})
  }
  getInterventionsSummary(caregiverId:string,intervention:string){
    const params = new HttpParams()
    .set('createdBy', caregiverId)
    .set('differIntervention', intervention);
    return this.http.get(`${environment.apiUrlNew}/nursing/questionnaries/getRiskIntervenSummary`,{params: params})
  }
  getInterventionSummaryData(caregiverId:string,interventionIndex:string){
    const params = new HttpParams()
    .set('caregiverId', caregiverId)
    .set('interventionIndex', interventionIndex);
    return this.http.get(`${environment.apiUrlNew}/nursing/questionnaries/getDfriIntervenSummary?inverventionIndex`,{params: params})
  }
  verifyAccessToken(userId:string,accessToken:string){
    const params = new HttpParams()
    .set('uid', userId)
    .set('accessToken', accessToken);
    
    return this.http.get(`${environment.apiUrlNew}/loginbasedonuser/getUserId`,{params: params})
  }
  getAlertsDetails(caregiverId:string){
    this.getHeaders();
    return this.http.get(`${environment.apiUrlNew}/alerts/getAlertsData/?caregiverId=`+caregiverId,{headers:this.header})
  }
  storePhysioTestData(postData: any){
    this.getHeaders();
    return this.http.post(`${environment.apiUrlNew}/physio/post/`, postData,{headers:this.header})
  }
  storeNotificationsData(postData: any){
    this.getHeaders();
    return this.http.post(`${environment.apiUrlNew}/notifications/post/`, postData,{headers:this.header})
  }
  sendStatus(postData: any){
    this.getHeaders();
    return this.http.put(`${environment.apiUrlNew}/nursing/questionaries/updateIntervenHistory`, postData,{headers:this.header})
  }
  getComments(interventionId:string){
    this.getHeaders();
    return this.http.get(`${environment.apiUrlNew}/nursing/questionaries/getComment?id=`+interventionId,{headers:this.header})
  }
  sendComment(postData: any){
    this.getHeaders();
    return this.http.post(`${environment.apiUrlNew}/nursing/questionaries/insertComments`, postData,{headers:this.header})
  }
  storeResidentProfileDetails(postData: any){
    this.getHeaders();
    return this.http.post(`${environment.apiUrlNew}/residents/storeResidentProfileViewDetails/`, postData,{headers:this.header})
  }
  storeResidentDetails(postData: any){
    this.getHeaders();
    return this.http.post(`${environment.apiUrlNew}/residents/post/`, postData,{headers:this.header})
  }
  storeQuestionaireDetails(postData: any){
    this.getHeaders();
    return this.http.post(`${environment.apiUrlNew}/questionnaire/post/`, postData,{headers:this.header})
  }
  sendContact(postData: any){
    this.getHeaders();
    return this.http.post(`${environment.apiUrlNew}/contactus/contactus/`, postData,{headers:this.header})
  }
  getLocationDetails(deviceId:string){
    this.getHeaders();
    return this.http.get(`${environment.apiUrlNew}/location/status/?thingKey=`+deviceId,{headers:this.header})
  }
  getLocationAuthenticateDetails(deviceId:string){
    this.getHeaders();
    return this.http.get(`${environment.apiUrlNew}/location/auth/?thingKey=`+deviceId,{headers:this.header})
  }

  getUserDataNew(username: string){
    this.getSHeader();
    return this.http.get(`${environment.apiUrlNew}/users/get/`,{headers:this.sheader}).pipe( mergeMap((users: any) => {
      const user = users.body.find(value => value.details.username === username);
      return of(user)
    }))
  }
  dischargeResident(postData: any){
    this.getHeaders();
    return this.http.put(`${environment.apiUrlNew}/residents/dischargeResident/`, postData,{headers:this.header})
  }
  updateProfileDetails(postData: any){
    this.getHeaders();
    return this.http.put(`${environment.apiUrlNew}/residents/update-profile/`, postData,{headers:this.header})
  }
  updateAlertAttendDetails(postData: any){
    this.getHeaders();
    return this.http.put(`${environment.apiUrlNew}/alerts/attend/`, postData,{headers:this.header})
  }
  updateAlertLogDetails(postData: any){
    this.getHeaders();
    return this.http.put(`${environment.apiUrlNew}/alerts/log/`, postData,{headers:this.header})
  }
  updateWearablesDetails(postData: any){
    this.getHeaders();
    return this.http.put(`${environment.apiUrlNew}/wearables/put/`, postData,{headers:this.header})
  }

  updateUser(userId: string, postData: any){
    this.getHeaders();
    return this.http.put(`${environment.apiUrlNew}/users/put/`, postData,{headers:this.header})
  }
  getHeaders(){
    this.header = new HttpHeaders().set(
      "Authorization",
      this.tokenStorage.getToken()
    );
  }
  _userInfo: any;
 
  signInNew(data: any): Observable<any> {   
    this.getSHeader();
    const date=new Date();
    const loginat=moment(date).format("YYYY-MM-DD HH:mm:ss");
   return this.http.post(`${environment.apiUrlNew}/logindata/post/`, {
    //return this.http.post(`${environment.apiUserUrl}/v3/v1/c/login/
        "username" : data.email,
        "password" : data.password,
        "loginAt" : loginat,
    }, {headers:this.sheader}).pipe(mergeMap( (user: any) => {
      
        this._userInfo = {
            idToken : user?.data?.access_token,
            refresh: user?.data?.access_token,
            result: user?.data,
        };
        if(user.data.email_verify === 1 && user.data.login_enabled === 'Yes' && user.data.useractive === 'Y'){
            localStorage.setItem('loggedInUser', JSON.stringify(user?.data));
        }
        return of(user)
    }));
}
}
