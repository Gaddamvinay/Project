import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { ToastrService } from "ngx-toastr";
import { TimeFormatService } from "../../shared/services/time-format.service";
import { CommonHttpService } from "../../shared/services/http-services/common-http.service";
import { Router } from "@angular/router";
export interface support {
	class: string;
	name: string;
	content: string;
	profile: string;
	status: string;
	date: string;
	maticon: string;
}
@Component({
	selector: "app-support",
	templateUrl: "./support.component.html",
	styleUrls: ["./support.component.scss"],
})
export class SupportComponent implements OnInit {
	/* Display View Types Start */
    displayviewType: number = 0;
    titleShow =false;
	viewType(no, questionType?: any)     {
        this.displayviewType = no;
        const question = questionType ? questionType.type : null;
        this.contactForm.patchValue({
            question
        })
	}
	/* Display View Types End */

    startLink = '';
	constructor( private router: Router, private commonHttp: CommonHttpService,private timeFormat: TimeFormatService, private _fb: FormBuilder, private http: HttpClient, private toaster: ToastrService) {
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        switch(user['user_type']){

            case "Caregiver" : {
              this.startLink = 'ca'
              break;
            }
            case "CA" : {
              this.startLink = 'hq'
              break;
            }
      
            case "FA" : {
              this.startLink = 'facility'
              break;
            }
            case "SSA" : {
                this.startLink = 'ssa'
                break;
            }
            case "WA" : {
            this.startLink = 'wa'
            break;
            }
      
          }
    }
    navigate(){
      this.router.navigate(['/', this.startLink])
    }

	supports: support[] = [
		/* {
			name: "James Anderson",
			content: "John Wick is fallen down",
			profile: "assets/images/users/1.jpg",
			status: "Walking",
			class: "critical",
			date: "30 mins ago",
			maticon: "assets/images/wet-floor.svg",
		},
		{
			name: "Michael Jorden",
			content: "Resident is saved with incomplete details",
			profile: "assets/images/users/2.jpg",
			status: "Sleeping",
			class: "warningn",
			date: "8 hours ago",
			maticon: "assets/images/alert.svg",
		},
		{
			name: "James Anderson",
			content: "Questionnire is successfully added",
			profile: "assets/images/users/3.jpg",
			status: "Sitting",
			class: "successn",
			date: "Guide on dashboard on how to do it (and state email/phone number to Arjo if further questions)",
			maticon: "assets/images/check.svg",
		}, */
	];
	loggedInUser: any;
    contactForm: FormGroup;
    countries = [
        {
            value: 'Sweden',
            label: 'Sweden'
        }
    ]
	faqs = [];
	supportFaq = [
    {
        group: 'Wearable',
        label: 10,
        icon: 'watch',
        questionType: [
            {
                type: 'Physical damage',
                label: 1,
                questions: [
                    {
                        question: "Wristband of a wearable is broken",
                        answerType: "normal",
                        answer: "In case of a broken wristband, please ensure to have the information below at hand before reaching out to Arjo for support<br />1. Wearable serial number (it is located on the back of the wearable)<br/>2. How the wristband broke<br/>3. Where the wristband is broken. Please see pictures below with specified areas<br/>Once you have the information, please reach out to Arjo for support via [Telephone] or [Email]"
                    },
                    {
                        question: "Watch is broken",
                        answerType: "normal",
                        answer: "In case of a broken watch, please have the information below at hand before reaching out to Arjo for support<br/>1. Wearable serial number (it is located on the back of the wearable)<br/>2. How did it break?<br/>&nbsp;&nbsp;&nbsp;&nbsp;1. Damage due to fall<br/>&nbsp;&nbsp;&nbsp;&nbsp;2. Damage due to water<br/>&nbsp;&nbsp;&nbsp;&nbsp;3. Damage while charging<br/>&nbsp;&nbsp;&nbsp;&nbsp;4. Other reasons.<br/>Once you have the information, please reach out to Arjo for support via [Telephone] or [Email]"
                    },
                ]
            },
            {
                type: 'Lost wearable',
                label: 2,
                questions: [
                    {
                        question: "Watch is lost or stolen",
                        answerType: "input",
                        inputLabel: 'Search for wearable',
                        answer: "In case of a lost or stolen wearable, please ensure to have the wearable serial number (located in the resident card details ) before reaching out to Arjo for support.<br/>Once you have the information, please reach out to Arjo for support via [Telephone] or [Email]"
                    },
                    
                ]
            },
            {
                type: 'Wearable data',
                label: 3,
                questions: [
                    {
                        question: "Functions of the wearable",
                        answer: "Following are the functions of the wearable<br/> 1. Fall detection - Detects and sends an alert in case of a fall accident<br/> 2. Real time activity indication - Near real time information (approximately once every hour) about the current activity of the resident - sleeping, walking, sitting etc.<br/>                     3. Sleep score - Indication of how well the resident has slept. <br/> 4. Strength score - Indication of the lower body strength of the resident. <br/> 5. Balance score - Indication of the balance of the resident."
                    },
                    {
                        question: "Data collected by the wearable",
                        answer: "1. **Fall detection** – The wearable notices if a resident falls, where it instantly sends a notification to the dashboard. The fall detection function analyses data regarding e.g. step length, distance walked, number of steps and fall direction, where one is informed if the fall occurred inside of the care facility or outside.<br/>                        2. **Real time activity indication** – The wearable sends information to the dashboard in near real time (approximately once every hour) regarding what the resident is doing (sleeping, walking, sitting etc.) by analysing e.g. steps, activity variance, postural transition and distance walked<br/>                        3. **Sleep score** – The wearable evaluates how well the resident has slept by analyzing different parameters associated with sleep e.g. total sleep hours, time in bed, position changes and time taken to fall back to sleep after waking up<br/>                        4. **Strength score** – The wearable collects data to understand the lower body strength of the resident by analyzing e.g. number of sit to stand transitions performed, time taken for the transitions and steps taken after the sit to stand transitions. When the physio test *30 seconds chair stand test* (30SCS) is performed in a closed environment and registered in the dashboard, the test forms the basis of the strength indication and validates the dynamic data.<br/>                        5. **Balance score** – The wearable collects data to understand the balance of the resident by analyzing e.g. the number of steps, distance walked and step length, which is done through real-time *3-min walking test* (3MWT) and *6-min walking test* (6MWT). When these tests are performed in a closed environment and registered in the dashboard, the tests forms the basis of the balance score and validates the dynamic data.<br/>                        6. **Fall risk indication** - The data collected from the wearable is complemented by a fall risk score calculated based on the resident questionnaires (e.g. DownTon Fall risk index and Stay Independent). This feature is episodic and is not dependent on the data collected from the wearable"
                    }
                ]
            },
            {
                type: 'Performance issues',
                label: 4,
                questions: [
                    {
                        question: "Display of the wearable is not working",
                        answer: 'If the display on the watch is not working, please follow these steps:<br/>1. Verify the dashboard data in LOA report under resident view is available until the latest hour. This will indicate that the display is not working but the wearable is still functioning. <br/>2. If no data is available for the previous hour in the dashboard, please verify if any notifications regarding the wearable has been sent. If any notification regarding “Low battery” or “Critically low battery” has been sent, the wearable is probably out of battery. Please charge the wearable and ensure to follow “Guidelines for optimal charging”.<br/>If the above steps solves the issue, please contact Arjo support at [Telephone ] or [Email]'
                    },
                    /*{
                        question: "What to do if the wearable button is not working?",
                        answer: "1. Refer to Interface Description document: 13-1852-08-00-01_JJ-2019-11-08<br />2. If none of the above steps solves the issue or if you have any other questions, please contact Arjo at xxxxx@arjo.com or +46-xxxxx"
                    },*/
                    {
                        question: "Wearable battery issues",
                        answer: 'If the wearable battery seems to drain fast please follow "Guidelines for optimal charging” to optimise the use of wearable. <br/>If the wearable battery level drops remarkably in less than 2 days with normal usage, there might be a problem with that particular wearable. Please reach out to Arjo support via [Telephone] or [Email]'
                    },
                    {
                        question: "Issues starting the wearable",
                        answer: "If there is an issue starting the wearable, please follow these steps:<br/>1. Put the wearable on the charging station<br/>2. Ensure that the charging station is properly connected to power<br/>3. Ensure that the USB cable is properly connected to the charging station.<br/>4. Ensure that the USB cable is properly connected to the wearable.<br/>5. Ensure to keep the wearable on the charging station for at least 15 minutes for the display to show up. <br/>If the above steps solves the issue, please contact Arjo support at [Telephone ] or [Email]"
                    }
                ]
            }
        ]
    },
    {
        group: 'Charging station',
        label: 11,
        icon: 'battery_charging_full',
        questionType: [
            {
                type: 'Charge wearable',
                label: 5,
                questions: [
                    {
                        question: "Guidelines for optimal charging",
                        answer: "To charge the wearable, please follow these steps:<br/>                        1. Keep the wearable on charging station. This will automatically start to charge the wearable<br/>             2. Ensure to keep the wearable on the charger for at least 30 mins. <br/>   3. Its preferred to charge the wearable to 100% and wait till it reaches <15% to charge again. <br/>           If the above steps solves the issue, please contact Arjo support at [Telephone ] or [Email]"
                    },
                ]
            },
            {
                type: 'Physical Damage',
                label: 6,
                questions: [
                    {
                        question: "Charging station is broken",
                        answer: "In case of a broken charging station, please ensure to have the serial number located on the back of the charging station before reaching out to Arjo for support. <br/>                        You can contact Arjo support at [Telephone ] or [Email]"
                    },
                ]
            },
            {
                type: 'Lost charging station',
                label: 7,
                questions: [
                    {
                        question: "Charging station is lost or stolen",
                        answer: "In case the charging station is lost or stolen, please ensure to have the serial number located on the back of the charging station before reaching out to Arjo for support. <br/>                        You can contact Arjo support at [Telephone ] or [Email]"
                    },
                ]
            },
            {
                type: 'Performance Issues',
                label: 8,
                questions: [
                    {
                        question: "Functions of the charging station",
                        answer: '1. Firmware and Model update -. Download model and firmware updates from the cloud to the wearable.<br/>                  2. Upload data - Uploads raw data from the wearable to the cloud'
                    },
                    {
                        question: "Issues charging the wearable",
                        answer: "If the charging station doesn't charge a wearable ensure that <br/>                        1. the charging station can charge another wearable to rule of Device specific problems. <br/>                        2. the USB connection between the charging station and wearable. <br/>                        3. the power cable is properly connected to the supply."
                    }
                ]
            }
        ]
    },
    {
        group: 'Dashboard',
        label: 13,
        icon: 'dashboard',
        questionType: [
            {
                type: 'Dashboard questions',
                label: 9,
                questions: [
                    {
                        question: "Localisation of data, e.g. information about residents, wearables, fall risk score, activity summary",
                        answer: "Guide on dashboard on how to do it (and state email/phone number to Arjo if further questions)"
                    },
                    {
                        question: "Resident data analysis",
                        answer: "Explanation on dashboard regarding what data points the risk score is calculated based on (e.g. activity monitoring, questionnaires) and what the different scores mean"
                    },
                    {
                        question: "Change wearable to another resident",
                        answer: 'If there is a need to move a wearable to another resident, please follow these steps:<br />1. Check that the Charging Station is properly connected to Gateway App via USB cable.<br />2. Check that the Charging Station is connected to Power.<br />3. Keep the wearable in the charging station.<br />4. Choose the feature "Discharge Resident" on Gateway App UI.<br />5. Wearable is now re-initialized and can be assigned to another Resident.<br />6. If none of the above steps solves the issue or if you have any other questions, please contact Arjo at xxxxx@arjo.com or +46-xxxxx'
                    },
                    {
                        question: "Map wearables to specific residents",
                        answer: "Guide on dashboard on how to do it (and state email/phone number to Arjo if further questions)"
                    },
                    {
                        question: "Update questionnaires for residents",
                        answer: "Guide on dashboard on how to do it (and state email/phone number to Arjo if further questions)"
                    },
                    {
                        question: "Update config settings for residents",
                        answer: "Guide on dashboard on how to do it (and state email/phone number to Arjo if further questions)"
                    },
                    {
                        question: "Extract data on residents (e.g. to give to relatives)",
                        answer: "If there is a need to extract the data of a resident, please follow these steps:<br />1. Use the 'Extract data' feature on residents tab for the resident which you want to extract data on. This will allow you to view all resident data in tabular format.<br />2. Click on Extract button. The data will be extracted into a CSV file format, which can be saved to your choice of location. <br />3. If none of the above steps solves the issue or if you have any other questions, please contact Arjo at xxxxx@arjo.com or +46-xxxxx"
                    },
                    {
                        question: "How to manage notifications (discharge, clear, confirm fall, actions recommended etc) ",
                        answer: "Guide on dashboard on how to do it (and state email/phone number to Arjo if further questions)"
                    },
                    {
                        question: "Blank data in dashboard ",
                        answer: "If the dashboard is not displaying any data, please follow these steps:<br />1. Check that you are connected to the internet <br />2. If there is an internet connection but no data is still available, try with restarting the Wifi router<br />3. If a laptop, PC or any other device is being used to access Dashboard then restarting the device might be the solution<br />4. If none of the above steps solves the issue or if you have any other questions, please contact Arjo at xxxxx@arjo.com or +46-xxxxx"
                    },
                    {
                        question: "Incorrect data in dashboard",
                        answer: "When incorrect data in dashboard is observed, then to clear browser cache.<br />To clear browser cache, please follow these steps for <br />Chrome(Windows/Linux)/Firefox(Windows/Linux)/Internet Explorer(Windows 10)/Microsoft Edge browsers(Windows-10) <br />1. Open browser on your computer.<br />2. Press combination of Ctrl+Shift+Alt buttons, pop-up windows displayed on the screen <br />3. Default all check boxes are selected<br />4. Check only the Cache images and files check box, Uncheck other check boxes<br />5. Click on appropriate browser button, this button should vary from browser to browser<br />-- 'Clear data' button on Chrome Browser<br />-- 'Clear now' button on Firefox/Mircosoft Edge <br />-- 'Delete' button on Internet Explorer <br />6. If this does not solve the issue or if you have any other questions, please contact Arjo at xxxxx@arjo.com or +46-xxxxx<br />To clear browser cache, please follow these steps for Safari (Windows-10 OS)<br />1. Open browser on your computer.<br />2. Press combination of Ctrl+Alt+E buttons, pop-up windows displayed on the screen <br />3. Click on 'Empty' button<br />4. If this does not solve the issue or if you have any other questions, please contact Arjo at xxxxx@arjo.com or +46-xxxxx"
                    },
                    {
                        question: "Scattered Pages & Corrupt icons in dashboard",
                        answer: "If Scattered Pages & Corrupt icons in dashboard are observed then please follow these steps:<br />1. Check that you are connected to the internet <br />2. If there is an internet connection but the program is still showing Scattered Pages & Corrupt icons in dashboard, try with restarting the Wifi router<br />3. If a laptop, PC or any other device is being used to access Dashboard then restarting the device might be the solution<br />4. If none of the above steps solves the issue or if you have any other questions, please contact Arjo at xxxxx@arjo.com or +46-xxxxx"
                    },
                    {
                        question: "Cannot access parts in dashboard",
                        answer: "If cannot access parts in dashboard then please follow these steps:<br />1. Check if your peers are able to access all parts of the dashboard.<br />2. If none of the above steps solves the issue or if you have any other questions, please contact Arjo at xxxxx@arjo.com or +46-xxxxx"
                    },
                    {
                        question: "Cannot access GATE Way app in dashboard",
                        answer: "If Cannot access Gateway app in dashboard then please follow these steps:<br />1. Check that you are connected to the internet <br />2. If there is an internet connection but the program Cannot access GATE Way app in dashboard, try with restarting the Wifi router<br />3. If a laptop, PC or any other device is being used to access Dashboard then restarting the device might be the solution<br />4. If none of the above steps solves the issue or if you have any other questions, please contact Arjo at xxxxx@arjo.com or +46-xxxxx"
                    },
                    
                ]
            }
        ]
    },
]


	ngOnInit(): void {
		this.contactForm = this._fb.group({
			country: [this.countries[0].value],
			firstName: [null, [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
			lastName: [null, [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
			email: [null, [Validators.required]],
			question: [null, [Validators.required]],
			message: [null, [Validators.required]]
        });
        this.getUserInfo();
		this.getDividedFaq(this.supportFaq);
    }
    getFormat(){
        const format = this.timeFormat.getFormat();
        return format;
	}
	today = new Date();
	changeFormat(format: string){
		this.timeFormat.changeFormat(format);
    }
    /**
     * Function to get the user data
     */
	getUserInfo(){
        const data = JSON.parse(localStorage.getItem('loggedInUser'))
        if(data){
            const {first_name: firstName, last_name: lastName, email} = data;
            this.contactForm.patchValue({
                firstName,
                lastName,
                email
            })
        }
	}
	getDividedFaq(supportFaq: any){
		supportFaq.forEach(data => {
			data.questionType.forEach(data => {
				const someValue = this.returnsArray(data);
				someValue.forEach(value => {
					this.faqs.push({
                        type: data.type,
                        question: value.question,
                        answer: value.answer
                    });
				})
			});
        })
	}
	returnsArray(data){
		return data.questions;
	}
	sendSuccessfully() {
		this.toaster.success('<div class="action-text"><span class="font-400">Question is successfully send</span></div><div class="action-buttons"></div>', "", {
			timeOut: 2000,
			progressBar: true,
			enableHtml: true,
			closeButton: false,
		});
    }
    /**
     * Funtion to post contact question 
     */
	sendQuestion(){
		const postData = {
			first_name: this.contactForm.value.firstName,
			last_name: this.contactForm.value.lastName,
            email: this.contactForm.value.email,
            enquiry: this.contactForm.value.message,
			message: this.contactForm.value.message,
			country: this.contactForm.value.country
		}
		this.commonHttp.sendContact(postData).subscribe(() =>{
			this.sendSuccessfully();
			this.contactForm.reset();
			this.getUserInfo();
            this.viewType(0);
		})
	}
}
