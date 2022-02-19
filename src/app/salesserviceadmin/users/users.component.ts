import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit,ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import{MatSelect} from '@angular/material/select'
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import { TokenStorageServiceService } from '../../auth/login/token-storage-service.service';
import { CommonAddModelComponent } from '../../shared/common-add-model/common-add-model.component';
import { CommonEditModelComponent } from '../../shared/common-edit-model/common-edit-model.component';
import { CommonHttpService } from '../../shared/services/http-services/common-http.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  facilityFilterForm: FormGroup;
  header:any;
  caregiverFilterForm: FormGroup;
  wardFilterForm: FormGroup;
  @ViewChild('select') private select: MatSelect;
  @ViewChild('faSelect') private faSelect: MatSelect;
  @ViewChild('faWSelect') private faWSelect: MatSelect;
  @ViewChild('waCusSelect') private waCusSelect: MatSelect;
  @ViewChild('waFaSelect') private waFaSelect: MatSelect;
  @ViewChild('waWadSelect') private waWadSelect: MatSelect;
  @ViewChild('caCusSelect') private caCusSelect: MatSelect;
  @ViewChild('caFaSelect') private caFaSelect: MatSelect;
  @ViewChild('caWadSelect') private caWadSelect: MatSelect;
  constructor(private matDialog: MatDialog,private tokenStorage: TokenStorageServiceService, private commonHttp: CommonHttpService,private http: HttpClient, private _fb: FormBuilder, private toastr: ToastrService) {
    this.customerFilterForm = this._fb.group({
      customer_id :[['']],
      customerSearch: [''],
    });
    this.facilityFilterForm = this._fb.group({
      customer_id: [['']],
      facility_id: [['']],
      customerSearch: [''],
      facilitySearch: ['']
    })
    this.caregiverFilterForm = this._fb.group({
      customer_id: [['']],
      facility_id: [['']],
      ward_id: [['']],
      customerSearch: [''],
      facilitySearch: [''],
      wardSearch: ['']
    })
    this.wardFilterForm = this._fb.group({
      customer_id: [['']],
      facility_id: [['']],
      ward_id: [['']],
      customerSearch: [''],
      facilitySearch: [''],
      wardSearch: ['']
    })
  }
  filtered: {
    customer: boolean;
    facility: boolean;
    ward: boolean;
    caregiver: boolean;
  } = {
    customer: false,
    facility: false,
    ward: false,
    caregiver: false
  }
  clearCustomerFilters(){
    this.filtered.customer = false;
    this.customerTableData = this.customerBefore;
    this.customerFilterForm.patchValue({
      customer_id: [''],
      customerSearch: ''
    })
  }

  showCustomerClear(){
    return this.customerFilterForm.value.customer_id.filter(value => value != '').length > 0;
  }

  clearFacilityFilters(){
    this.filtered.facility = false;
    this.fwaTableData = this.fwaBefore;
    this.facilityFilterForm.patchValue({
      customer_id: [''],
      facility_id: [''],
      customerSearch: '',
      facilitySearch: ''
    })
  }

  showFacilityClear(){
    return this.facilityFilterForm.value.customer_id.filter(value => value != '').length > 0 || this.facilityFilterForm.value.facility_id.filter(value => value != '').length > 0;
  }

  clearCaregiverFilters(){
    this.filtered.caregiver = false;
    this.caregiverTableData = this.caregiverBefore;
    this.caregiverFilterForm.patchValue({
      customer_id: [''],
      facility_id: [''],
      ward_id: [''],
      wardSearch: '',
      customerSearch: '',
      facilitySearch: ''
    })
  }

  clearWardFilters(){
    this.filtered.ward = false;
    this.wardAdminTableData = this.wardBefore;
    this.wardFilterForm.patchValue({
      customer_id: [''],
      facility_id: [''],
      ward_id: [''],
      wardSearch: '',
      customerSearch: '',
      facilitySearch: ''
    })
  }

  getFwaFilterCustomers(){
    this.facilityFilterForm.valueChanges.subscribe(() => {
      this.faSelect.close();
    });
    return this.customerList.filter(value => value.customer_name.toLowerCase().includes(this.facilityFilterForm.get('customerSearch').value.toLowerCase()) || this.facilityCustomerIds.includes(value.customer_id));
  }

  getCaregiverFilterCustomers(){
    this.caregiverFilterForm.valueChanges.subscribe(() => {
      this.caCusSelect.close();
    });
    return this.customerList.filter(value => value.customer_name.toLowerCase().includes(this.caregiverFilterForm.get('customerSearch').value.toLowerCase()) || this.caregiverCustomerIds.includes(value.customer_id));
  }

  getHqFilterCustomers(){
    this.customerFilterForm.valueChanges.subscribe(() => {
      this.select.close();
    });
    return this.customerList.filter(value => value.customer_name.toLowerCase().includes(this.customerFilterForm.get('customerSearch').value.toLowerCase()) || this.customerIds.includes(value.customer_id));
  }

  getWaFilterCustomers(){
    this.wardFilterForm.valueChanges.subscribe(() => {
      this.waCusSelect.close();
    });
    return this.customerList.filter(value => value.customer_name.toLowerCase().includes(this.wardFilterForm.get('customerSearch').value.toLowerCase()) || this.wardCustomerIds.includes(value.customer_id));
  }

  getFwaFilterFacilities(){
    this.facilityFilterForm.valueChanges.subscribe(() => {
      this.faWSelect.close();
    });
    if(this.facilityFilterForm.get('customer_id').value.length < 1){
      return this.facilityList;
    }
   // console.log(this.facilityList.filter(value => value.facility_name.toLowerCase().includes(this.facilityFilterForm.get('facilitySearch').value.toLowerCase()) || this.facilityIds.includes(value.facility_id)).filter(value => this.facilityCustomerIds.includes(value.customer_id)));
    return this.facilityList.filter(value => value.facility_name.toLowerCase().includes(this.facilityFilterForm.get('facilitySearch').value.toLowerCase()) || this.facilityIds.includes(value.facility_id)).filter(value => this.facilityCustomerIds.includes(value.customer_id))
  
  }


  getCaregiverFilterFacility(){
    this.caregiverFilterForm.valueChanges.subscribe(() => {
      this.caFaSelect.close();
    });
    if(this.caregiverFilterForm.get('customer_id').value.length < 1){
      return this.facilityList;
    }
    return this.facilityList.filter(value => value.facility_name.toLowerCase().includes(this.caregiverFilterForm.get('facilitySearch').value.toLowerCase()) || this.caregiverFacilityIds.includes(value.facility_id)).filter(value => this.caregiverCustomerIds.includes(value.customer_id))
  }

  getCaregiverFilterWards(){
    this.caregiverFilterForm.valueChanges.subscribe(() => {
      this.caWadSelect.close();
    });
    if(this.caregiverFilterForm.get('facility_id').value.length < 1){
      return this.wardList;
    }
    return this.wardList.filter(value => value.ward_name.toLowerCase().includes(this.caregiverFilterForm.get('wardSearch').value.toLowerCase()) || this.wardIds.includes(value.ward_id)).filter(value => this.caregiverFacilityIds.includes(value.facility_id))
  }

  getWardAdminFilterFacility(){
    this.wardFilterForm.valueChanges.subscribe(() => {
      this.waFaSelect.close();
    });
    if(this.wardFilterForm.get('customer_id').value.length < 1){
      return this.facilityList;
    }
    return this.facilityList.filter(value => value.facility_name.toLowerCase().includes(this.wardFilterForm.get('facilitySearch').value.toLowerCase()) || this.wardFacilityIds.includes(value.facility_id)).filter(value => this.wardCustomerIds.includes(value.customer_id))
  }

  getWardAdminFilterWards(){
    this.wardFilterForm.valueChanges.subscribe(() => {
      this.waWadSelect.close();
    });
    if(this.wardFilterForm.get('facility_id').value.length < 1){
      return this.wardList;
    }
    return this.wardList.filter(value => this.wardFacilityIds.includes(value.facility_id)).filter(value => value.ward_name.toLowerCase().includes(this.wardFilterForm.get('facilitySearch').value.toLowerCase()) || this.wardAdminWardIds.includes(value.ward_id))
  }

  showCaregiverClear(){
    return this.caregiverFilterForm.value.customer_id.filter(value => value != '').length > 0 || this.caregiverFilterForm.value.facility_id.filter(value => value != '').length > 0 || this.caregiverFilterForm.value.ward_id.filter(value => value != '').length > 0;
  }

  showWardClear(){
    return this.wardFilterForm.value.customer_id.filter(value => value != '').length > 0 || this.wardFilterForm.value.facility_id.filter(value => value != '').length > 0 || this.wardFilterForm.value.ward_id.filter(value => value != '').length > 0;
  }

  getCustomerById(id: any){
    if(id !== ''){
      return this.customerList.find(value => value.customer_id === id).customer_name;
    }
  }
  customerList = [];
  get customerIds(){
    if(this.customerFilterForm.get('customer_id').value.length > 1){
      return this.customerFilterForm.get('customer_id').value.filter(value => value !== '');
    }
    return this.customerFilterForm.get('customer_id').value;
  }
  get facilityCustomerIds(){
    if(this.facilityFilterForm.get('customer_id').value.length > 1){
      return this.facilityFilterForm.get('customer_id').value.filter(value => value !== '');
    }
    return this.facilityFilterForm.get('customer_id').value;
  }
  get caregiverCustomerIds(){
    if(this.caregiverFilterForm.get('customer_id').value.length > 1){
      return this.caregiverFilterForm.get('customer_id').value.filter(value => value !== '');
    }
    return this.caregiverFilterForm.get('customer_id').value;
  }
  get wardCustomerIds(){
    if(this.wardFilterForm.get('customer_id').value.length > 1){
      return this.wardFilterForm.get('customer_id').value.filter(value => value !== '');
    }
    return this.wardFilterForm.get('customer_id').value;
  }
  getFacilityById(id: any){
    if(id !== ''){
      return this.facilityList.find(value => value.facility_id === id).facility_name;
    }
  }
  getWardById(id: any){
    if(id !== ''){
      return this.wardList.find(value => value.ward_id === id).ward_name;
    }
  }
  get facilityIds(){
    if(this.facilityFilterForm.get('facility_id').value.length > 1){
      return this.facilityFilterForm.get('facility_id').value.filter(value => value !== '');
    }
    return this.facilityFilterForm.get('facility_id').value;
  }
 
  get wardIds(){
    if(this.caregiverFilterForm.get('ward_id').value.length > 1){
      return this.caregiverFilterForm.get('ward_id').value.filter(value => value !== '');
    }
    return this.caregiverFilterForm.get('ward_id').value;
  }
  get wardAdminWardIds(){
    if(this.wardFilterForm.get('ward_id').value.length > 1){
      return this.wardFilterForm.get('ward_id').value.filter(value => value !== '');
    }
    return this.wardFilterForm.get('ward_id').value;
  }
  get wardFacilityIds(){
    if(this.wardFilterForm.get('facility_id').value.length > 1){
      return this.wardFilterForm.get('facility_id').value.filter(value => value !== '');
    }
    return this.wardFilterForm.get('facility_id').value;
  }
  get caregiverFacilityIds(){
    if(this.caregiverFilterForm.get('facility_id').value.length > 1){
      return this.caregiverFilterForm.get('facility_id').value.filter(value => value !== '');
    }
    return this.caregiverFilterForm.get('facility_id').value;
  }
  getCustomer(){
    this.http.get(`${environment.apiUrlNew}/customers/get/`,{headers:this.header}).subscribe((customers: any) => {
      if(customers.itemCount > 0){
        this.customerList = customers.body.map(value => {
          return {
            customer_name: value.details.customer_name,
            customer_id: value.details.customer_id,
          }
        }).sort((a:any, b:any) => {
          return a.customer_name > b.customer_name ? 1: -1;
        });
      }
    });
  }
  facilityList = [];
  getFacility(){
    this.http.get(`${environment.apiUrlNew}/facilities/get/`,{headers:this.header}).subscribe((facilities: any) => {
      if(facilities.itemCount > 0){
        this.facilityList = facilities.body.map(value => {
          return {
            facility_name: value.details.facility_name,
            facility_id: value.details.facility_id,
            customer_id: value.details.customer_id
          }
        }).sort((a:any, b:any) => {
          return a.facilityName > b.facilityName ? 1: -1;
        });
      }
    })
  }
  ngOnInit(): void {
    this.getUsers();
    this.getCustomer();
    this.getFacility();
    this.getWards();
    this.customerFilterForm.valueChanges.subscribe(() => {
      if(this.customerIds.length === 1){
        if(this.customerIds[0] !== ''){
          this.customerTableData = this.customerBefore.filter(value => this.customerIds.includes(value.customer_id))
          this.filtered.customer = true;
        }else{
          this.customerTableData = this.customerBefore;
        }
      }else if(this.customerIds.length > 1){
        this.customerTableData = this.customerBefore.filter(value => this.customerIds.includes(value.customer_id));
        this.filtered.customer = true;
      }
    })
    this.facilityFilterForm.valueChanges.subscribe(() => {
      if(this.facilityCustomerIds.length === 1){
        if(this.facilityCustomerIds[0] !== ''){
          this.fwaTableData = this.fwaBefore.filter(value => this.facilityCustomerIds.includes(value.customer_id))
          this.filtered.facility = true;
        }else{
          this.fwaTableData = this.fwaBefore;
          if(this.filtered.facility){
            this.clearFacilityFilters();
          }
        }
      }else if(this.facilityCustomerIds.length > 1){
        this.fwaTableData = this.fwaBefore.filter(value => this.facilityCustomerIds.includes(value.customer_id));
        this.filtered.facility = true;
      }

      if(this.facilityIds.length === 1){
        if(this.facilityIds[0] !== ''){
          this.fwaTableData = this.fwaTableData.filter(value => {
            const exists = value.facilityIds.find(value => this.facilityIds.includes(value));
            if(exists){
              return true;
              
            }
            else{
              return false;
            }
          })
          this.filtered.facility = true;
        }else{
          this.fwaTableData = this.fwaTableData;
        }
      }else if(this.facilityIds.length > 1){
        this.fwaTableData = this.fwaTableData.filter(value => {
          const exists = value.facilityIds.find(value => this.facilityIds.includes(value));
          if(exists){
            return true;
          }
          else{
            return false;
          }
        });
        this.filtered.facility = true;
      }
    })
    this.caregiverFilterForm.valueChanges.subscribe(() => {
      if(this.caregiverCustomerIds.length === 1){
        if(this.caregiverCustomerIds[0] !== ''){
          this.caregiverTableData = this.caregiverBefore.filter(value => this.caregiverCustomerIds.includes(value.customer_id))
          this.filtered.caregiver = true;
        }else{
          this.caregiverTableData = this.caregiverBefore;
          if(this.filtered.caregiver){
            this.clearCaregiverFilters()
          }
        }
      }else if(this.caregiverCustomerIds.length > 1){
        this.caregiverTableData = this.caregiverBefore.filter(value => this.caregiverCustomerIds.includes(value.customer_id));
        this.filtered.caregiver = true;
      }
      if(this.caregiverFacilityIds.length === 1){
        if(this.caregiverFacilityIds[0] !== ''){
          this.caregiverTableData = this.caregiverTableData.filter(value => {
            const exists = value.facilityIds.find(value => this.caregiverFacilityIds.includes(value));
            if(exists){
              return true;
            }
            else{
              return false;
            }
          })
          this.filtered.caregiver = true;
        }else{
          this.caregiverTableData = this.caregiverTableData;
        }
      }else if(this.caregiverFacilityIds.length > 1){
        this.caregiverTableData = this.caregiverTableData.filter(value => {
          const exists = value.facilityIds.find(value => this.caregiverFacilityIds.includes(value));
          if(exists){
            return true;
          }
          else{
            return false;
          }
        });
        this.filtered.caregiver = true;
      }
      if(this.wardIds.length === 1){
        if(this.wardIds[0] !== ''){
          this.caregiverTableData = this.caregiverTableData.filter(value => {
            const exists = value.wardIds.find(value => this.wardIds.includes(value));
            if(exists){
              return true;
            }
            else{
              return false;
            }
          })
          this.filtered.caregiver = true;
        }else{
          this.caregiverTableData = this.caregiverTableData;
        }
      }else if(this.wardIds.length > 1){
        this.caregiverTableData = this.caregiverTableData.filter(value => {
          const exists = value.wardIds.find(value => this.wardIds.includes(value));
          if(exists){
            return true;
          }
          else{
            return false;
          }
        });
        this.filtered.caregiver = true;
      }
    })
    this.wardFilterForm.valueChanges.subscribe(() => {
      if(this.wardCustomerIds.length === 1){
        if(this.wardCustomerIds[0] !== ''){
          this.wardAdminTableData = this.wardBefore.filter(value => this.wardCustomerIds.includes(value.customer_id))
          this.filtered.ward = true;
        }else{
          this.wardAdminTableData = this.wardBefore;
          if(this.filtered.ward){
            this.clearWardFilters();
          }
        }
      }else if(this.wardCustomerIds.length > 1){
        this.wardAdminTableData = this.wardBefore.filter(value => this.wardCustomerIds.includes(value.customer_id));
        this.filtered.ward = true;
      }
      if(this.wardFacilityIds.length === 1){
        if(this.wardFacilityIds[0] !== ''){
          this.wardAdminTableData = this.wardAdminTableData.filter(value => {
            const exists = value.facilityIds.find(value => this.wardFacilityIds.includes(value));
            if(exists){
              return true;
            }
            else{
              return false;
            }
          })
          this.filtered.ward = true;
        }else{
          this.wardAdminTableData = this.wardAdminTableData;
        }
      }else if(this.wardFacilityIds.length > 1){
        this.wardAdminTableData = this.wardAdminTableData.filter(value => {
          const exists = value.facilityIds.find(value => this.wardFacilityIds.includes(value));
          if(exists){
            return true;
          }
          else{
            return false;
          }
        });
        this.filtered.ward = true;
      }
      if(this.wardAdminWardIds.length === 1){
        if(this.wardAdminWardIds[0] !== ''){
          this.wardAdminTableData = this.wardAdminTableData.filter(value => {
            const exists = value.wardAdminWardIds.find(value => this.wardAdminWardIds.includes(value));
            if(exists){
              return true;
            }
            else{
              return false;
            }
          })
          this.filtered.ward = true;
        }else{
          this.wardAdminTableData = this.wardAdminTableData;
        }
      }else if(this.wardAdminWardIds.length > 1){
        this.wardAdminTableData = this.wardAdminTableData.filter(value => {
          const exists = value.wardAdminWardIds.find(value => this.wardAdminWardIds.includes(value));
          if(exists){
            return true;
          }
          else{
            return false;
          }
        });
        this.filtered.ward = true;
      }
    })

   
  }

  isLoading = false;
  customerFilterForm: FormGroup;
  customerBefore = [];
  caregiverBefore = [];
  wardBefore = [];
  fwaBefore = [];
  wardList = [];
  getHeaders(){
    this.header = new HttpHeaders().set(
      "Authorization",
      this.tokenStorage.getToken()
    );
  }
  getWards(){
    this.getHeaders();
		this.http.get(`${environment.apiUrlNew}/wards/get/`,{headers:this.header}).subscribe((wards: any) => {
      if(wards.itemCount > 0){
        this.wardList = wards.body.map(value => {
          return {
            ward_name: value.details.ward_name,
            ward_id: value.details.ward_id,
            facility_id: value.details.facility_id,
          }
        }).sort((a:any, b:any) => {
          return a.name > b.name ? 1: -1;
        })
      }
		})
  }
  initial = true;
  getUsers(){
    let users: any = localStorage.getItem('users');
    if(users){
      this.commonHttp.getUserDetails().subscribe((dbusers: any) => {
        if(users != JSON.stringify(dbusers)){
          localStorage.setItem('users', JSON.stringify(dbusers));
          this.loadMoreUsers();
        }
      })
      this.loadMoreUsers();
    }else{
      this.isLoading = true;
      this.commonHttp.getUserDetails().subscribe((users: any) => {
        localStorage.setItem('users', JSON.stringify(users))
        this.isLoading = false;
        this.loadMoreUsers();
      }, () => {
        this.isLoading = false;
        localStorage.setItem('users', JSON.stringify({body: [], itemCount: 0}));
      });
    }
  }
  loadMoreUsers(){
    let data: any = localStorage.getItem("users");
    this.clearWardFilters();
    this.clearCaregiverFilters();
    this.clearFacilityFilters();
    this.clearCustomerFilters();
    if (data) {
      data = JSON.parse(data);
      if(data.itemCount > 0){
        const hq = data.body.filter(value => value.details.user_type === 'CA');
        const fwa = data.body.filter(value => value.details.user_type === 'FA');
        const caregiver = data.body.filter(value => value.details.user_type === 'Caregiver');
        const wa = data.body.filter(value =>  value.details.user_type === 'WA');
        this.customerTableData = hq.map(value => {
          return {
            id: value.details.id,
            Name: `${value.details.first_name} ${value.details.last_name}`,
            Email: value.details.email,
            Created_on: value.meta.created_at,
            Customer_name: value.details.customer_name,
            customer_id: value.assigned?.customers.customer_id,
            Phone_number: value.details.phone_number,
            User_name: value.details.username,
            lock: value.access.loginattempts === '3',
            lockTest: 'This customer admin account is locked',
            Login_enabled: value.access.login_enabled
          }
        });
        this.customerBefore = this.customerTableData;
        this.fwaTableData = fwa.map(value => {
          return {
            id: value.details.id,
            Name: `${value.details.first_name} ${value.details.last_name}`,
            Email: value.details.email,
            Created_on: value.meta.created_at,
            Customer_name: value.details.customer_name,
            customer_id: value.assigned?.customers?.customer_id,
            // 'Facility/ies_assigned': value.assigned?.facilities !== null ? value.assigned.facilities?.map(value => {
            //   return value.facility_name
            // }).toString() : '',
            'Facility/ies_assigned': value.details.facility_name,
            facilityIds: value.assigned?.facilities !== null? value.assigned.facilities?.map(value => {
              return value.facility_id
            }) : [],
            Phone_number: value.details.phone_number,
            User_name: value.details.username,
            lock: value.access.loginattempts === '3',
            lockTest: 'This facility admin account is locked',
            Login_enabled: value.access.login_enabled
          }
        })
        this.fwaBefore = this.fwaTableData;
        this.caregiverTableData = caregiver.map(value => {
          return {
            id: value.details.id,
            Name: `${value.details.first_name} ${value.details.last_name}`,
            Email: value.details.email,
            Created_on: value.meta.created_at,
            Customer_name: value.details.customer_name,
            customer_id: value.assigned.customers?.customer_id,
            // 'Facility/ies_assigned': value.assigned.facilities[0] !== null ? value.assigned.facilities[0]?.map(value => {
            //   return value.facility_name
            // }).toString() : '',
            'Facility/ies_assigned': value.details.facility_name,
            facilityIds: value.assigned.facilities[0] !== null? value.assigned.facilities[0]?.map(value => {
              return value.facility_id
            }) : [],
            'Wards_assigned': value.assigned.wards[0] !== null ? value.assigned.wards[0]?.map(value => {
              return value.ward_name
            }).toString() : '',
            wardIds: value.assigned.wards[0] !== null? value.assigned.wards[0]?.map(value => {
              return value.ward_id
            }) : [],
            Phone_number: value.details.phone_number,
            User_name: value.details.username,
            lock: value.access.loginattempts === '3',
            lockTest: 'This caregiver account is locked',
            Login_enabled: value.access.login_enabled
          }
        })
        this.caregiverBefore = this.caregiverTableData;
        this.wardAdminTableData = wa.map(value => {
          return {
            id: value.details.id,
            Name: `${value.details.first_name} ${value.details.last_name}`,
            Email: value.details.email,
            Created_on: value.meta.created_at,
            Customer_name: value.assigned.customers?.customer_name,
            customer_id: value.assigned.customers?.customer_id,
            'Facility/ies_assigned': value.assigned.facilities[0] !== null ? value.assigned.facilities[0]?.map(value => {
              return value.facility_name
            }).toString() : '',
            facilityIds: value.assigned.facilities[0] !== null? value.assigned.facilities[0]?.map(value => {
              return value.facility_id
            }) : [],
            'Ward_assigned': value.assigned.wards[0] !== null ? value.assigned.wards[0]?.map(value => {
              return value.ward_name
            }).toString() : '',
            wardIds: value.assigned.wards[0] !== null? value.assigned.wards[0]?.map(value => {
              return value.ward_id
            }) : [],
            Phone_number: value.details.phone_number,
            User_name: value.details.username,
            lock: value.access.loginattempts === '3',
            lockTest: 'This ward admin account is locked',
            Login_enabled: value.access.login_enabled
          }
        })
        this.wardBefore = this.wardAdminTableData;
      }
      this.initial = false;
    }
  }
  customerDisplayedColumns = ['Name', 'Email', 'Phone_number', 'Login_enabled', 'Created_on', 'Customer_name'];
  facilityDisplayedColumns = ['Name', 'Email', 'Phone_number', 'Login_enabled', 'Created_on', 'Facility/ies_assigned', 'Customer_name'];
  caregiverDisplayedColumns = ['Name', 'Email', 'Phone_number', 'Login_enabled', 'Created_on', 'Wards_assigned', 'Facility/ies_assigned', 'Customer_name'];
  wardAdminDisplayedColumns = ['Name', 'Email', 'Phone_number', 'Login_enabled', 'Created_on', 'Ward_assigned', 'Facility/ies_assigned', 'Customer_name'];
  customerWidths = ['18%','18%','18%',  '18%', '18%', '18%'];
  facilityWidths = ['14%','14%','14%', '14%', '14%', '14%', '14%'];
  caregiverWidths = ['12%','12%','12%', '12%', '12%', '12%', "12%", '12%'];
  customerTableData: any[] = [
  ];
  fwaTableData: any[] = [
  ];
  caregiverTableData: any[] = [
  ];
  wardAdminTableData: any[] = [
  ];
  addUser(user: string){
    const dialog = this.matDialog.open(CommonAddModelComponent, {
      disableClose: true,
      panelClass: 'dialog-popup',
      width: '920px',
      data: {
        dialogType: `Add new ${user}`
      }
    })
    dialog.afterClosed().subscribe(data => {
      if(data){
        this.getUsers();
      }
    })
  }
  editUser(user: string, userName?: string){
    const dialog = this.matDialog.open(CommonEditModelComponent, {
      disableClose: true,
      panelClass: 'dialog-popup',
      width: '920px',
      data: {
        dialogType: `Edit ${user}`,
        userName
      }
    })
    dialog.afterClosed().subscribe(data => {
      if(data){
        let users: any = localStorage.getItem('users');
				users = JSON.parse(users);
				users.itemCount = 9999;
				localStorage.setItem('users', JSON.stringify(users));
        this.getUsers();
      }
    })
  }
  doOperation(event: any, tabs: string){
    this.getHeaders();
    if(event.action === 'Unlock'){
      const {id} = event.selected;
      this.http.put(`${environment.apiUrlNew}/users/unlock/`, {id: id},{headers:this.header}).subscribe(() => {
        let users: any = localStorage.getItem('users');
				users = JSON.parse(users);
				users.itemCount = 9999;
				localStorage.setItem('users', JSON.stringify(users));
        this.getUsers()
      })
    }
    switch(tabs){
      case 'customers':
        switch(event.action){
          case 'Edit':
            this.editUser('customer admin', event.selected.User_name);
            break;
          case 'Access':
            this.changeLoginAccess(event);
            break;
          case 'Reset password': 
            
            break;
        }
        break;
      case 'facility admin':
        switch(event.action){
          case 'Edit':
            this.editUser('facility admin', event.selected.User_name)
            break;
          case 'Access':
            this.changeLoginAccess(event);
            break;
          case 'Reset password': 
            
            break;
        }
        break;
      case 'ward admin':
        switch(event.action){
          case 'Edit':
            this.editUser('ward admin', event.selected.User_name)
            break;
          case 'Access':
            this.changeLoginAccess(event);
            break;
          case 'Reset password': 
            
            break;
        }
        break;
      case 'caregivers':
        switch(event.action){
          case 'Edit':
            this.editUser('caregiver user', event.selected.User_name)
            break;
          case 'Access':
            this.changeLoginAccess(event);
            break;
          case 'Reset password': 
            
            break;
        }
        break;
    }
  }
  changeLoginAccess(event: any){
    this.getHeaders();
    if(event.selected.id){
      this.http.put(`${environment.apiUrlNew}/users/login-access/`, {
        id: event.selected.id,
        login_enabled: event.selected.Login_enabled === 'Yes' ? 'No' : 'Yes' 
      },{headers:this.header}).subscribe(data => {
        this.toastr.success(`<div class="action-text"><span class="font-400">${data}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        let users: any = localStorage.getItem('users');
				users = JSON.parse(users);
				users.itemCount = 9999;
				localStorage.setItem('users', JSON.stringify(users));
        this.getUsers();
      }, (err) => {
        let message='';
          if(err.error.text){
            message=err.error.text;
          }
          if(err.error.message){
            message=err.error.message;
          }
        this.toastr.error(`<div class="action-text"><span class="font-400">${message}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
      })
    }
  }
}
