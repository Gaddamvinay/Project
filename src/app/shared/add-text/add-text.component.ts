import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddResientTestComponent } from './add-resient-test/add-resient-test.component';
import { CommonTestAddComponent } from './common-test-add/common-test-add.component';
import { CommonTestEditComponent } from './common-test-edit/common-test-edit.component';

interface caregivers {
	'Caregiver_name': string,
	'Wards_assigned': string,
	'Phone_number': string,
	'Email_address': string,
	'Screen_time_usage': string,
	'Residents_profile_viewed': number,
	'Most_visited_page': string,
	'Last_active_time': string
}

export interface facilities {
  'Registered_rooms': number;
  'Registered_residents': number;
  'Registered_wearables': number;
  'Questionnaire_fall': number;
  'Facility_name': string;
  'Wearable_fall': number;
  'facility_number': string
}

interface residents {
	'Residents_name': string;
	'Last_known_status': string;
	'Questionnaire_fall': number;
	'Wearable_fall': number;
	wearableFallIncreased: boolean,
  	fallDiff: number,
	'Balance': string;
	'Strength': string;
	'Sleep': string;
	'Name_on_wearable': string;
	'Ward_name': string;
	'Room_name': string;
	'Battery_status': number;
}

export interface wards {
  'Registered_rooms': number;
  'Registered_residents': number;
  'Registered_wearables': number;
  'Questionnaire_fall': number;
  'Ward_name': string;
  'Wearable_fall': number;
  'wearableFallIncreased': boolean;
  'fallDiff': number;
  'Ward_manager_name': string;
  'Ward_telephone_number': string;
  'Ward_number': string;
}

interface wearables {
	'Wearables_name': string;
	'Wearable_status': string;
	'Battery_status': string;
	'Resident_name': string;
	'Ward_name': string;
	'Room_name': string;
	'Bed_number': string;
}

interface room {
	'Room_name': string;
	'Residents_Name': string;
	'Total_beds': number;
	'Beds_available': number;
	'Wearable_fall': number
	wearableFallIncreased: boolean,
  	fallDiff: number,
}

@Component({
  selector: 'app-add-text',
  templateUrl: './add-text.component.html',
  styleUrls: ['./add-text.component.scss']
})
export class AddTextComponent implements OnInit {

  constructor(private matDialog: MatDialog) { }

  ngOnInit(): void {
    this.init();
  }

  init(){
    this.getCaregivers();
    this.getWards();
    this.getFacilities();
    this.getRooms();
    this.getWearables();
    this.getResidents();
    this.getCustomers();
  }

  getResidents(){
    const residents = localStorage.getItem('residents');
    if(residents){
      const values = JSON.parse(residents);
      this.residentTableData = values.map(value => {
        return {
          Residents_name : `${value.firstName} ${value.lastName}`,
          Last_known_status: value.ResidentStatus || '',
          Questionnaire_fall: value.questionnaire_fall_count > 0 ? 'Yes' : 'No',
          Wearable_fall: value.wearableFall || 0,
          Balance: value.Strength,
          Strength: value.Strength,
          Sleep: value.Sleep,
          Wearables_name: value.deviceId,
          Ward_name : value.wardName ? value.wardName : '',
          Room_number: value.roomName ? value.roomName: '',
          Battery_status: value.Battery ? value.Battery : 0,
          User_id: value.userId
        } 
      })
    }
  }

  getWearables(){
    const wearables = localStorage.getItem('wearables');
    if(wearables){
      const values = JSON.parse(wearables);
      this.wearableTableData = values.map(value => {
        return {
          Serial_no: value.serialNo,
          Assigned_to: value.assignedTo || '',
          serialId: value.serialId
        }
      })
    }
  }

  getFacilities(){
    const facilities = localStorage.getItem('testFacilities');
    if(facilities){
      const values = JSON.parse(facilities);
      this.facilityTableData = values.map(value => {
        return {
          Facility_name: value.facilityName,
          Wearable_fall: value.noOfFalls,
          Questionnaire_fall: value.historyFalls > 0 ? 'Yes' : 'No',
          Registered_wearables: value.registeredWearables,
          Registered_residents: value.registeredResidents,
          Registered_rooms: value.registeredRooms,
          facility_number: value.facilityNumber
        }
      })
    }
  }

  getWards(){
    const wards = localStorage.getItem('wards');
    if(wards){
      const values = JSON.parse(wards);
      this.wardTableData = values.map(ward => {
        let contactPhone = ward.contactPhone.map(mobile => {
          if (mobile.phone) {
            return `${mobile.ext} ${mobile.phone} `
          }
          return `${mobile} `
        })
        return {
          Ward_name: ward.name,
          Ward_manager_name: ward.wardManagerName,
          Wearable_fall: ward.wearableFall || 0,
          Questionnaire_fall: ward.questionnaire_fall_count > 0 ? 'Yes' : 'No',
          Ward_telephone_number: contactPhone.toString(),
          wearableFallIncreased: ward.wearableFallInc || true,
          fallDiff: ward.wearableFallDiff || 0,
          Registered_wearables: ward.deviceCount || 0,
          Registered_residents: ward.residentCount || 0,
          Registered_rooms: ward.roomCount || 0,
          Ward_number: ward.ward_number || 0
        }
      })
    }
  }

  getRooms(){
    const rooms = localStorage.getItem('rooms');
    if(rooms){
      const wardCounts = [];
      const values = JSON.parse(rooms);
      this.roomTableData = values.map(room => {
        return {
					room_id: room.roomId,
					Room_name: room.RoomName,
					Residents_Name: room.Residents ? room.Residents.join(", ") : '',
					Wearable_fall: room.Count || 0,
					wearableFallIncreased: room.wearableFallInc || true,
          fallDiff: room.wearableFallDiff || 0
				}
      })
    }
  }

  getCaregivers(){
    const caregivers = localStorage.getItem('caregivers');
    if(caregivers){
      const values = JSON.parse(caregivers);
      this.careGiverTableData = values.map(caregivers => {
        return {
          caregiver_id: caregivers.caregiverId,
          Caregiver_name: `${caregivers.firstName} ${caregivers.lastName}`,
          firstName: caregivers.firstName,
          lastName: caregivers.lastName,
          Wards_assigned: Object.keys(caregivers.wards || []).map(key => caregivers.wards[key].wardName).join(", "),
          wards: caregivers.wards || [],
          Phone_number: caregivers.mobile,
          Email_address: caregivers.email,
          Screen_time_usage: caregivers.screenTime ? caregivers.screenTime +' min': "",
          Residents_profile_viewed: caregivers.residentProfileView || "",
          Most_visited_page: caregivers.mostVisitPage || "",
          Last_active_time:caregivers.lastActive || "",
        }
      })
    }
  }

  getCustomers(){
    const customers = localStorage.getItem('testCustomers');
    if(customers){
      const values = JSON.parse(customers);
      this.customerTableData = values.map(customer => {
        return {
          customerNumber: customer.customerNumber,
          Customer_name: customer.customer_name,
          Contact_name: customer.contactName,
          No_of_disabled_facilities: customer.noOfDisabled || 0,
          No_of_facilities: customer.noOfFacilities || 0
        }
      })
    }
  }

  addCaregiver(){
    const dialog = this.matDialog.open(CommonTestAddComponent, {
      disableClose: true,
      panelClass: 'dialog-popup',
      width: '920px',
      data: {
        dialogType: 'Add new caregiver'
      }
    })
    dialog.afterClosed().subscribe(data => {
      if(data){
        this.init();
      }
    })
  }
  addFacility(){
    const dialog = this.matDialog.open(CommonTestAddComponent, {
      disableClose: true,
      panelClass: 'dialog-popup',
      width: '920px',
      data: {
        dialogType: 'Add new facility'
      }
    })
    dialog.afterClosed().subscribe(data => {
      if(data){
        this.init();
      }
    })
  }

  addCustomer(){
    const dialog = this.matDialog.open(CommonTestAddComponent, {
      disableClose: true,
      panelClass: 'dialog-popup',
      width: '920px',
      data: {
        dialogType: 'Add new customer'
      }
    })
    dialog.afterClosed().subscribe(data => {
      if(data){
        this.init();
      }
    })
  }

  addWearable(){
    const dialog = this.matDialog.open(CommonTestAddComponent, {
      disableClose: true,
      panelClass: 'dialog-popup',
      width: '448px',
      data: {
        dialogType: 'Add new wearable'
      }
    })
    dialog.afterClosed().subscribe(data => {
      if(data){
        this.init();
      }
    })
  }

  addWard(){
    const dialog = this.matDialog.open(CommonTestAddComponent, {
      disableClose: true,
      panelClass: 'dialog-popup',
      width: '920px',
      data: {
        dialogType: 'Add new ward'
      }
    })
    dialog.afterClosed().subscribe(data => {
      if(data){
        this.init();
      }
    })
  }

  addResident(obj: any, action?: string, id?: any){
    const dialogRef = this.matDialog.open(AddResientTestComponent, {
			disableClose: true,
			data: {
				payload: obj,
        action: action ? action : 'Add',
        userId: id
			},
		});

		dialogRef.afterClosed().subscribe((result) => {
			if(result){
        this.init()
      }
		});
  }

  addRoom(){
    const dialog =this.matDialog.open(CommonTestAddComponent, {
      disableClose: true,
      panelClass: 'dialog-popup',
      width: '448px',
      data: {
        dialogType: 'Add new room'
      }
    })
    dialog.afterClosed().subscribe(data => {
      if(data){
        this.init();
      }
    })
  }

  doOperation(event: any, tab: string){
    switch(tab){
      case 'caregivers':
        switch(event.action){
          case 'Edit':
            this.editCaregiver(event.selected.caregiver_id);
            break;
          case 'Delete': 
            this.deleteCaregiver(event.selected.caregiver_id);
            this.init();
            break;
        }
        break;
      case 'wards':
        switch(event.action){
          case 'Edit':
            this.editWard(event.selected.Ward_number);
            break;
          case 'Delete': 
            this.deleteWard(event.selected.ward_number);
            this.init();
            break;
        }
        break;
      case 'facilities':
        switch(event.action){
          case 'Edit':
            this.editFacility(event.selected.facilityNumber);
            break;
          case 'Delete': 
            this.deleteFacility(event.selected.facilityNumber);
            this.init()
            break;
        }
        break;
      case 'rooms':
        switch(event.action){
          case 'Edit':
            this.editRoom(event.selected.room_id);
            break;
          case 'Delete': 
            this.deleteRoom(event.selected.room_id);
            this.init();
            break;
        }
        break;
      case 'wearables':
        switch(event.action){
          case 'Edit':
            this.editWearable(event.selected.serialId);
            break;
          case 'Delete': 
            this.deleteWearable(event.selected.serialId);
            this.init();
            break;
        }
        break;
      case 'customers':
        switch(event.action){
          case 'Edit':
            this.editCustomer(event.selected.customerNumber);
            break;
          case 'Delete': 
            this.deleteCustomer(event.selected.customerNumber);
            this.init();
            break;
        }
        break;
      case 'residents':
        switch(event.action){
          case 'Edit':
            const residents = localStorage.getItem('residents');
            if(residents){
              const values = JSON.parse(residents);
              const resident = values.find(value => value.userId === event.selected.User_id).localData;
              this.addResident(resident, 'Edit', event.selected.User_id);
            }
            break;
          case 'Delete': 
            this.deleteResident(event.selected.User_id);
            this.init();
            break;
        }
        break;
    }
  }

  deleteCaregiver(id :any){
    const caregivers = localStorage.getItem('caregivers');
    const values = JSON.parse(caregivers);
    const filtered = values.filter(value => value.caregiverId !== id);
    localStorage.setItem('caregivers', JSON.stringify(filtered))
  }

  deleteResident(id :any){
    const residents = localStorage.getItem('residents');
    const values = JSON.parse(residents);
    const filtered = values.filter(value => value.userId !== id);
    localStorage.setItem('residents', JSON.stringify(filtered))
  }

  deleteCustomer(id :any){
    const customers = localStorage.getItem('testCustomers');
    const values = JSON.parse(customers);
    const filtered = values.filter(value => value.customerNumber !== id);
    localStorage.setItem('testCustomers', JSON.stringify(filtered))
  }

  deleteWard(id :any){
    const wards = localStorage.getItem('wards');
    const values = JSON.parse(wards);
    const filtered = values.filter(value => value.ward_number !== id);
    localStorage.setItem('wards', JSON.stringify(filtered))
  }

  deleteRoom(id :any){
    const rooms = localStorage.getItem('rooms');
    const values = JSON.parse(rooms);
    const filtered = values.filter(value => value.roomId !== id);
    localStorage.setItem('rooms', JSON.stringify(filtered))
  }

  deleteWearable(id :any){
    const wearables = localStorage.getItem('wearables');
    const values = JSON.parse(wearables);
    const filtered = values.filter(value => value.serialId !== id);
    localStorage.setItem('wearables', JSON.stringify(filtered))
  }

  deleteFacility(id :any){
    const testFacilities = localStorage.getItem('testFacilities');
    const values = JSON.parse(testFacilities);
    const filtered = values.filter(value => value.facilityNumber !== id);
    localStorage.setItem('testFacilities', JSON.stringify(filtered))
  }

  editCaregiver(id: any){
    const dialog = this.matDialog.open(CommonTestEditComponent, {
			disableClose: true,
			panelClass: 'dialog-popup', 
			width: '920px',
			data: {
				dialogType: 'Edit caregiver',
				caregiverId: id
			}
		})
		dialog.afterClosed().subscribe(data => {
			if (data) {
				this.init();
			}
		})
  }

  editCustomer(id: any){
    const dialog = this.matDialog.open(CommonTestEditComponent, {
			disableClose: true,
			panelClass: 'dialog-popup', 
			width: '920px',
			data: {
				dialogType: 'Edit customer',
				customer_id: id
			}
		})
		dialog.afterClosed().subscribe(data => {
			if (data) {
				this.init();
			}
		})
  }

  editWard(id: any){
    const dialog = this.matDialog.open(CommonTestEditComponent, {
			disableClose: true,
			panelClass: 'dialog-popup',
			width: '920px',
			data: {
				dialogType: 'Edit ward',
				wardId: id
			}
		})
		dialog.afterClosed().subscribe(data => {
			if (data) {
				this.init();
			}
		})
  }

  editWearable(id: any){
    const dialog = this.matDialog.open(CommonTestEditComponent, {
			disableClose: true,
			panelClass: 'dialog-popup',
			width: '448px',
			data: {
				dialogType: 'Edit wearable',
				serialId: id
			}
		})
		dialog.afterClosed().subscribe(data => {
			if (data) {
				this.init();
			}
		})
  }

  editRoom(id: any){
    const dialog = this.matDialog.open(CommonTestEditComponent, {
			disableClose: true,
			panelClass: 'dialog-popup',
			width: '448px',
			data: {
				dialogType: 'Edit room',
				roomId: id
			}
		})
		dialog.afterClosed().subscribe(data => {
			if (data) {
				this.init();
			}
		})
  }

  editFacility(id: number){
    const dialog = this.matDialog.open(CommonTestEditComponent, {
			disableClose: true,
			panelClass: 'dialog-popup',
			width: '920px',
			data: {
				dialogType: 'Edit facility',
				caregiverId: id
			}
		})
		dialog.afterClosed().subscribe(data => {
			if (data) {
				this.init();
			}
		})
  }
  careGiverWidths: string[] = ['16%', '19%', '16%', '16%', '16%', '16%', '1%'];
	careGiverDisplayedColumns: string[] = ['Caregiver_name', 'Wards_assigned', 'Screen_time_usage', 'Residents_profile_viewed', 'Most_visited_page', 'Last_active_time', 'caregiver_id'];
  careGiverTableData: caregivers[] = [];

  roomWidths: string[] = ['20%', '60%', '20%'];
	roomDisplayedColumns: string[] = ['Room_name', 'Residents_Name', 'Wearable_fall', 'room_id'];
  roomTableData: room[] = [];
  
  wardWidths: string[] = ['12.5%', '12.5%', '12.5%', '12.5%', '12.5%', '12.5%', '12.5%', '12.5%'];
  wardDisplayedColumns: string[] = ['Ward_name', 'Registered_rooms', 'Registered_residents', 'Registered_wearables', 'Questionnaire_fall', 'Wearable_fall', 'Ward_manager_name'];
  wardTableData: wards[] = [];

  facilityWidths: string[] = ['12.5%','12.5%','12.5%','12.5%','12.5%','12.5%','12.5%','12.5%'];
  facilityDisplayedColumns: string[] = ['Facility_name','Questionnaire_fall','Wearable_fall','Registered_rooms','Registered_residents','Registered_wearables'];
  facilityTableData: facilities[] = [
  ] 

  wearableWidths: string[] = ['50%','50%'];
  wearableDisplayedColumns: string[] = ['Serial_no','Assigned_to',];
  wearableTableData: any[] = [
  ] 

  residentWidths: string[] = ['9%','9%','9%','9%','9%','9%','9%','9%','9%','9%','9%'];
  residentDisplayedColumns: string[] = ['Residents_name','Last_known_status','Questionnaire_fall','Wearable_fall','Balance','Strength', 'Sleep', 'Wearables_name', 'Ward_name','Room_number','Battery_status'];
  residentTableData: any[] = [
  ] 

  customerWidths: string[] = ['25%', '25%', '25%', '25%'];
  customerDisplayedColumns: string[] = ['Customer_name', 'Contact_name','No_of_facilities','No_of_disabled_facilities'];
  customerTableData: any[] = [
  ] 

  isLoading: {
    caregiver: boolean;
    room: boolean;
    wards: boolean;
    facilities: boolean;
    wearable: boolean;
    resident: boolean;
    customer: boolean;
  } = {
    caregiver: false,
    room: false,
    wards: false,
    facilities: false,
    wearable: false,
    resident: false,
    customer: false
  }
}
