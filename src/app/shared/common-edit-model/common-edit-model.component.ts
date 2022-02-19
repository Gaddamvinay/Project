import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { caregivers, ward } from '../common-add-model/common-add-model.component';
import { CustomValidators } from '../custom-validators';
import { CommonHttpService } from '../services/http-services/common-http.service';
import { forkJoin, Observable, empty, of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from './../../shared/services/common.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { mergeMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MatSelect } from '@angular/material/select';
import { TokenStorageServiceService } from '../../auth/login/token-storage-service.service';

@Component({
  selector: 'app-common-edit-model',
  templateUrl: './common-edit-model.component.html',
  styleUrls: ['./common-edit-model.component.scss']
})
export class CommonEditModelComponent implements OnInit {
  // datauserList: any[] = [];
  careGiversList: any[] = [];
  usersList: any[] = [];
  wardList: any[] = [];
  editWardForm: FormGroup;
  editCaregiverForm: FormGroup;
  editFacilityForm: FormGroup;
  editRoomForm: FormGroup;
  editCustomerForm: FormGroup;
  dialogType: string = '';
  previousValues: any;
  header:any;

  @ViewChild('inputFileReader') inputFileReader: any;
  @ViewChild('select') private select: MatSelect;
  @ViewChild('careWadSelect') private careWadSelect: MatSelect;
  @ViewChild('careSelect') private careSelect: MatSelect;
  showVerifyNum = false;
  getNum(index: number) {
    const value = this.contactPhone.at(index).value;
    return value.phone !== '' && value.ext !== '';
  }
  otpLength = 4;
  verifyOpen(index: number) {
    this.showVerifyNum = true;
  }
  otp: any;
  onOtpChange(value: any) {
    this.otp = value;
  }
  verify() {
    this.showVerifyNum = false;
  }
  customerHqForm: FormGroup;
  facilityAdminForm: FormGroup;
  wardAdminForm: FormGroup;
  caregiverForm: FormGroup;
  public records: any[] = []
  extraFields = false;
  constructor(private _fb: FormBuilder,
    public common: CommonService,
    private tokenStorage: TokenStorageServiceService,
    private http: HttpClient,
    public dialogRef: MatDialogRef<CommonEditModelComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private commonHttp: CommonHttpService,
    private toastr: ToastrService) {
    this.previousValues = this.data;
    this.customerHqForm = this._fb.group({
      customer: [{ value: '', disabled: true }, Validators.required],
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
      email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
      ext: ['+91', Validators.required],
      phoneNumber: ['', Validators.required]
    })
    this.facilityAdminForm = this._fb.group({
      customer: [{ value: '', disabled: true }, Validators.required],
      facility: [{ value: '', disabled: true }, Validators.required],
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
      email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
      ext: ['+91', Validators.required],
      phoneNumber: ['', Validators.required]
    })
    this.wardAdminForm = this._fb.group({
      customer: [{ value: '', disabled: true }, Validators.required],
      facility: [{ value: '', disabled: true }, Validators.required],
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
      ward: [{ value: '', disabled: true }, Validators.required],
      email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
      ext: ['+91', Validators.required],
      phoneNumber: ['', Validators.required]
    })
    this.caregiverForm = this._fb.group({
      customer: [{ value: '', disabled: true }, Validators.required],
      facility: [{ value: '', disabled: true }, Validators.required],
      ward: [{ value: [''], disabled: true }, Validators.required],
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
      email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
      ext: ['+91', Validators.required],
      phoneNumber: ['', Validators.required]
    })
    this.editWardForm = this._fb.group({
      customerSearch: [''],
      customer_name: this.data.extraFields ? ([{ value: this.data.customer_id ? this.data.customer_id : '', disabled: this.data.customer_id ? true : false }, Validators.required]) : [''],
      facilityName: [{ value: this.data.facility_id ? this.data.facility_id : '', disabled: this.data.facility_id ? true : false }, Validators.required],
      facilitySearch: [''],
      wardManager: [''],
      managerSearch: [''],
      name: ['', Validators.required],
      caregiverUserid: [['select'], Validators.required],
      caregiverSearch: [''],
      contactPhone: this._fb.array([this._fb.group({
        phone: ['', Validators.required],
        ext: ['+91', Validators.required]
      })])
    })
    this.editRoomForm = this._fb.group({
      rooms: this._fb.array([this._fb.group({
        roomNumber: ['', Validators.required],
      })])
    })
    this.editCaregiverForm = this._fb.group({
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
      ext: ['+91', Validators.required],
      caregiverPhoneNumber: ['', [Validators.required, CustomValidators.patternValidator(/^[0-9]{3,14}$/, { hasNumber: true })]],
      caregiverEmail: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
      assignWard: [[''], Validators.required],
      wardSearch: ''
    })
    this.editFacilityForm = this._fb.group({
      customer_name: [{ value: this.data.customer_id ? this.data.customer_id : '', disabled: this.data.customer_id ? true : false }, Validators.required],
      facilityName: ['', Validators.required],
      facilityAddress: ['', Validators.required],
      wardCount: ['', Validators.required],
      facilityAdmin: [''],
      caregiverSearch: ['']
    })
    this.editCustomerForm = this._fb.group({
      customer_name: ['', Validators.required],
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9äåö_]*$')]],
      customer_status: ['', Validators.required],
      customerAddress: ['', Validators.required],
      email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
      ext: ['+91', Validators.required],
      phoneNumber: ['', [Validators.required, CustomValidators.patternValidator(/^[0-9]{3,14}$/, { hasNumber: true })]]
    })
    this.dialogType = this.data.dialogType;
    this.extraFields = this.data.extraFields ? this.data.extraFields : false;
    if (this.data.profileEdit) {
      this.editCustomerForm.get('customer_name').disable();
      this.editCustomerForm.get('customer_status').disable();
    }
  }
  get caregiverUserIds() {
    if (this.editWardForm.get('caregiverUserid').value.length > 1) {
      return this.editWardForm.get('caregiverUserid').value.filter(value => value !== 'select');
    }
    return this.editWardForm.get('caregiverUserid').value;
  }
  get contactPhone() {
    return this.editWardForm.get('contactPhone') as FormArray
  }

  get rooms() {
    return this.editRoomForm.get('rooms') as FormArray
  }

  get wardIds() {
    if (this.editCaregiverForm.get('assignWard').value.length > 1) {
      return this.editCaregiverForm.get('assignWard').value.filter(value => value !== '');
    }
    return this.editCaregiverForm.get('assignWard').value;
  }


  getWFilterManager() {
    return this.careGiversList.filter(value => value.name.toLowerCase().includes(this.editWardForm.get('managerSearch').value.toLowerCase()) && value.facility_id === this.editWardForm.get('facilityName').value);
  }


  getWardFilterManager() {
  //remove duplicate values
  let obj = {};
  const unique = () => {
    let result = [];

    this.wardList.forEach((item, i) => {
      obj[item['managername']] = i;
    });

    for (let key in obj) {
      let index = obj[key];
      result.push(this.wardList[index])
    }

    return result;
  }

  this.wardList = unique();
  //
  const wards = this.wardList.filter(value => value.managername.toLowerCase().includes(this.editWardForm.get('managerSearch').value.toLowerCase()) && value.facility_id === this.editWardForm.get('facilityName').value);
  return wards.filter(value => value.managername.toLowerCase() != '')
 }

  checkWardExists() {
    if (this.editWardForm.get('facilityName').value !== '') {
      const wards = this.wardList.filter(ward => ward.facility_id === this.editWardForm.get('facilityName').value);
      const exists = wards.find(value => value.name.toLowerCase() === this.editWardForm.get('name').value.toLowerCase());
      if (exists && this.data.wardId && exists.ward_number !== this.data.wardId) {
        return true;
      }
    }
    return false;
  }

  addRoom() {
    this.rooms.push(this._fb.group({
      roomNumber: ['', Validators.required],
    }));
  }

  removeRoom(index: number) {
    this.rooms.removeAt(index)
  }

  ngOnInit(): void {
    this.header = new HttpHeaders().set(
      "Authorization",
      this.tokenStorage.getToken()
    );
    if (this.dialogType === 'Edit ward') {
      this.getCustomers();
      this.getNewCareGivers(this.data.wardId);
      this.getFacilities();
      this.getNewWards();
    } else if (this.dialogType === 'Edit caregiver') {
      this.getNewWards();
      this.getFacilities();
      this.getCustomers();
      this.getCaregiverById(this.data.userId)
    } else if (this.dialogType === 'Edit room') {
      // this.getAllWards(this.auth.userInfo["custom:org_unit_id"], this.data.userId);
      this.editRoomForm.patchValue({
        rooms: [{ roomNumber: this.data.roomData.Room_name }]
      })
    } else if (this.dialogType === 'Edit facility') {
      this.getCustomers();
      this.getFacilities();
      this.getNewCaregiver();
    } else if (this.dialogType === 'Edit customer') {
      this.getCustomer();
      this.getCustomers();
    } else if (this.dialogType === 'Edit profile details') {
      this.getCustomer();
      this.getCustomers();
    } else if (this.dialogType === 'Edit customer admin') {
      this.getCustomers();
      this.getUser();
    } else if (this.dialogType === 'Edit facility admin') {
      this.getCustomers();
      this.getFacilities();
      this.getUser();
    } else if (this.dialogType === 'Edit ward admin') {
      this.getFacilities();
      this.getCustomers();
      this.getNewWards();
      this.getUser();
    } else if (this.dialogType === 'Edit caregiver user') {
      this.getNewWards();
      this.getCustomers();
      this.getFacilities();
      this.getUser();
    }
    this.commonHttp.getUserDetails().subscribe((dbusers: any) => {
      if (dbusers.itemCount > 0) {
        this.users = dbusers.body.map(val => {
          return {
            email: val.details.email,
            username: val.details.username
          }
        })
      }
    })
  }
  user: any;
  getUser() {
    this.commonHttp.getUserDetails().subscribe((users: any) => {
      if (users.itemCount > 0) {
        const user = users.body.find(value => value.details.username === this.data.userName);
        this.user = user;
        if (this.dialogType === 'Edit customer admin') {
          const customer = user.assigned.customers.customer_id;
          const { first_name: firstName, last_name: lastName, email, phone_number } = user.details;
          this.customerHqForm.patchValue({
            customer,
            firstName,
            lastName,
            email,
          })
          if (phone_number.split(" ").length > 1) {
            const ext = phone_number.split(" ")[0];
            const phoneNumber = phone_number.split(" ")[1];
            this.customerHqForm.patchValue({
              ext,
              phoneNumber
            })
          } else {
            this.customerHqForm.patchValue({
              ext: '+91',
              phoneNumber: phone_number.split(" ")[0]
            })
          }
        } else if (this.dialogType === 'Edit facility admin') {
          const customer = user.assigned.customers.customer_id;
          const facility = user.assigned.facilities[0].facility_id;
          const { first_name: firstName, last_name: lastName, email, phone_number } = user.details;
          if (phone_number.split(" ").length > 1) {
            const ext = phone_number.split(" ")[0];
            const phoneNumber = phone_number.split(" ")[1];
            this.facilityAdminForm.patchValue({
              customer,
              facility,
              firstName,
              lastName,
              email,
              ext,
              phoneNumber
            })
          } else {
            this.facilityAdminForm.patchValue({
              customer,
              facility,
              firstName,
              lastName,
              email,
              ext: '+91',
              phoneNumber: phone_number
            })
          }
        } else if (this.dialogType === 'Edit ward admin') {
          const facility = user.assigned.facilities[0][0].facility_id;
          const customer = user.assigned.customers.customer_id;
          const ward = user.assigned.wards[0][0].ward_id;
          const { first_name: firstName, last_name: lastName, email, phone_number } = user.details;
          if (phone_number.split(" ").length > 1) {
            const ext = phone_number.split(" ")[0];
            const phoneNumber = phone_number.split(" ")[1];
            this.wardAdminForm.patchValue({
              customer,
              facility,
              ward,
              firstName,
              lastName,
              email,
              ext,
              phoneNumber
            })
          } else {
            this.wardAdminForm.patchValue({
              customer,
              facility,
              firstName,
              ward,
              lastName,
              email,
              ext: '+91',
              phoneNumber: phone_number
            })
          }
        } else if (this.dialogType === 'Edit caregiver user') {
          const facility = user.assigned.facilities[0][0].facility_id;
          const customer = user.assigned.customers.customer_id;
          const wards = user.assigned.wards[0].map(value => {
            return value.ward_id;
          });
          this.previousWards = wards;
          const { first_name: firstName, last_name: lastName, email, phone_number } = user.details;
          if (phone_number.split(" ").length > 1) {
            const ext = phone_number.split(" ")[0];
            const phoneNumber = phone_number.split(" ")[1];
            this.caregiverForm.patchValue({
              customer,
              facility,
              ward: wards,
              firstName,
              lastName,
              email,
              ext,
              phoneNumber
            })
          } else {
            this.caregiverForm.patchValue({
              customer,
              facility,
              ward: wards,
              firstName,
              lastName,
              email,
              ext: '+91',
              phoneNumber: phone_number
            })
          }
        }
      }
    })
  }
  getNewWards() {
    this.http.get(`${environment.apiUrlNew}/wards/get/`,{headers:this.header}).subscribe((wards: any) => {
      if (wards.itemCount > 0) {
        this.wardList = wards.body.map(value => {
          return {
            name: value.details.ward_name,
            ward_number: value.details.ward_id,
            facility_id: value.details.facility_id,
            managername: value.details.manager_name,
            managerid: value.details.manager_id,
            all: value
          }
        }).sort((a: any, b: any) => {
          return a.name > b.name ? 1 : -1;
        })
      }
    })
  }
  customerList = [];
  getCustomers() {
    this.http.get(`${environment.apiUrlNew}/customers/get/`,{headers:this.header}).subscribe((customers: any) => {
      this.customerList = customers.body.map(value => {
        return {
          customer_name: value.details.customer_name,
          customer_id: value.details.customer_id,
        }
      });
    });
  }
  facilityList = [];
  getFacilities() {
    this.http.get(`${environment.apiUrlNew}/facilities/get/`,{headers:this.header}).subscribe((facilities: any) => {
      this.facilityList = facilities.body.map(value => {
        return {
          facilityName: value.details.facility_name,
          facilityId: value.details.facility_id,
          facilityAdmin: value.details.facility_admin,
          facilityadminid: value.details.facility_adminid,
          customerId: value.details.customer_id
        }
      });
    })
  }
  getNewFacilityadmin() {
    this.commonHttp.getUserDetails().subscribe((data: any) => {
      this.usersList = data.body.map(value => {
        return {
          id: value.details.caregiver_id,
          name: `${value.details.caregiver_firstName} ${value.details.caregiver_lastName}`,
          customer_id: value.details.customer_id
        }
      }).sort((a: any, b: any) => {
        return a.name > b.name ? 1 : -1;
      })
      this.getFacility(this.data.facilityId);
    })
  }

  users1 = [];
  getusers() {
    this.commonHttp.getUserDetails().subscribe((users: any) => {
      this.users1 = users.body.map(value => {
        return {
          userName: value.details.username
        }
      });
    })
  } checkFacilityExists() {
    if (this.editFacilityForm.get('customer_name').value !== '') {
      const facilities = this.facilityList.filter(facility => facility.customerId === this.editFacilityForm.get('customer_name').value);
      const exists = facilities.find(value => value.facilityName.toLowerCase() === this.editFacilityForm.get('facilityName').value.toLowerCase() && this.facility.details.facility_name.toLowerCase() !== this.editFacilityForm.get('facilityName').value.toLowerCase());
      if (exists) {
        return true;
      }
    }
    return false;
  }
  checkCustomerExists() {
    if (this.editCustomerForm.get('customer_name').value !== '') {
      const exists = this.customerList.find(value => value.customer_name.toLowerCase() === this.editCustomerForm.get('customer_name').value.toLowerCase() && this.customer.details.customer_name.toLowerCase() !== this.editCustomerForm.get('customer_name').value.toLowerCase());
      if (exists) {
        return true;
      }
    }
    return false;
  }
  customer: any;
  getCustomer() {
    this.http.get(`${environment.apiUrlNew}/customers/get/`,{headers:this.header}).subscribe((dbCustomers: any) => {
      const customer = dbCustomers.body.find(value => value.details.customer_id === this.data.customerId);
      if (customer) {
        const { customer_name, customer_status, contact_firstname: firstName, contact_lastname: lastName, customer_address: customerAddress, contact_phone, contact_email: email } = customer.details;
        const ext = contact_phone.split(' ')[0];
        const phoneNumber = contact_phone.split(' ')[1];
        this.customer = customer;
        this.editCustomerForm.patchValue({
          customer_name,
          firstName,
          lastName,
          customer_status,
          customerAddress,
          email,
          ext,
          phoneNumber
        })
      }
    })
  }

  ////////////////////

  /////////////////////



  getNewCaregiver() {
    this.http.get(`${environment.apiUrlNew}/caregivers/get/`,{headers:this.header}).subscribe((data: any) => {
      this.careGiversList = data.body.map(value => {
        return {
          id: value.details.caregiver_id,
          name: `${value.details.caregiver_firstName} ${value.details.caregiver_lastName}`,
          customer_id: value.details.customer_id
        }
      }).sort((a: any, b: any) => {
        return a.name > b.name ? 1 : -1;
      })
      this.getFacility(this.data.facilityId);
    })
  }
  facility: any;
  getFacility(facilityId: any) {
    this.http.get(`${environment.apiUrlNew}/facilities/get/`,{headers:this.header}).subscribe((facilities: any) => {
      if (facilities.itemCount > 0) {
        const facility = facilities.body.find(value => value.details.facility_id === facilityId);
        this.facility = facility;
        const { customer_id: customer_name, facility_address: facilityAddress, facility_name: facilityName, facility_adminid: facilityAdmin, total_wards: wardCount } = facility.details;
        this.editFacilityForm.patchValue({
          customer_name,
          facilityName,
          facilityAddress,
          wardCount,
          facilityAdmin
        })
      }
    })
  }

  getWardById(id: string) {
    return this.http.get(`${environment.apiUrlNew}/wards/get/`,{headers:this.header}).pipe(mergeMap((wards: any) => {
      const ward = wards.body.find(value => value.details.ward_id === id);
      return of(ward)
    }))
  }
  previousCaregivers = [];
  getNewCareGivers(wardId: string) {
    forkJoin([this.getWardById(wardId), this.http.get(`${environment.apiUrlNew}/caregivers/get/`,{headers:this.header})]).subscribe((data: any) => {
      let caregiverUserIds = [];
      let wardDetails: any = data[0];
      if (wardDetails.details.caregivers && wardDetails.details.caregivers.length) {
        wardDetails.details.caregivers.forEach(element => {
          if (element) {
            caregiverUserIds.push(element.userid)
          }
        });
      }
      this.previousCaregivers = caregiverUserIds;
      this.editWardForm.patchValue({
        wardManager: wardDetails.details.manager_id,
        name: wardDetails.details.ward_name,
        caregiverUserid: caregiverUserIds
      });
      const contactPhone = wardDetails.details.ward_number.split(',').map(value => {
        const mobile = value.split(" ");
        return {
          ext: mobile[0],
          phone: mobile[1]
        }
      })
      Object.assign(wardDetails, { contactPhone: contactPhone })

      if (wardDetails.contactPhone && wardDetails.contactPhone.length) {
        this.removePhoneNumber(0);
        wardDetails.contactPhone.forEach(element => {
          if (element.phone) {
            this.contactPhone.push(this._fb.group({
              phone: [element.phone, Validators.required],
              ext: [element.ext, Validators.required]
            }));
          } else {
            this.contactPhone.push(this._fb.group({
              phone: [element, Validators.required],
              ext: [Validators.required]
            }));
          }
        });
      }
      this.careGiversList = data[1].body.map(value => {
        return {
          id: value.details.caregiver_id,
          name: `${value.details.caregiver_firstName} ${value.details.caregiver_lastName}`,
          facility_id: value.details.facility_id,
          customer_id: value.details.customer_id,
          assigned_wards: value.details.assigned_wards,
        }
      }).sort((a: any, b: any) => {
        return a.name > b.name ? 1 : -1;
      })

    })
  }
  getCaregivers() {
    this.editWardForm.valueChanges.subscribe(() => {
      this.select.close();
    });
    if (this.editWardForm.get('facilityName').value !== '') {
      if (this.caregiverUserIds.filter(value => value !== 'select').length > 0) {
        const selectedUser = [];
        const notSelected = [];
        this.careGiversList.forEach(value => {
          if (this.caregiverUserIds.includes(value.id)) {
            selectedUser.push(value)
          } else {
            notSelected.push(value);
          }
        })
        this.careGiversList = [...selectedUser, ...notSelected];
        return this.careGiversList.filter(value => value.name.toLowerCase().includes(this.editWardForm.get('caregiverSearch').value.toLowerCase()) && value.facility_id === this.editWardForm.get('facilityName').value);
      } else {
        return this.careGiversList.filter(value => value.name.toLowerCase().includes(this.editWardForm.get('caregiverSearch').value.toLowerCase()) && value.facility_id === this.editWardForm.get('facilityName').value);
      }
    }
  }

  getName(caregiverId: string) {
    return this.careGiversList.find(value => value.id === caregiverId)?.name;
  }

  // sample
  // getName(datauserList: string) {
  //   return this.datauserList.find(value => value.id === datauserList)?.name;
  // }

  getFilterFacilities() {
    if (this.dialogType === 'Edit facility admin') {
      if (this.facilityAdminForm.get('customer').value !== '') {

        return this.facilityList.filter(value => value.customerId === this.facilityAdminForm.get('customer').value)
      }
    } else if (this.dialogType === 'Edit ward admin') {
      if (this.wardAdminForm.get('customer').value !== '') {
        return this.facilityList.filter(value => value.customerId === this.wardAdminForm.get('customer').value)
      }
    } else if (this.dialogType === 'Edit caregiver user') {
      if (this.caregiverForm.get('customer').value !== '') {
        return this.facilityList.filter(value => value.customerId === this.caregiverForm.get('customer').value)
      }
    } else if (this.dialogType === 'Edit ward') {
      if (this.extraFields) {
        if (this.editWardForm.get('customer_name').value !== '') {
          return this.facilityList.filter(value => value.facilityName.toLowerCase().includes(this.editWardForm.get('facilitySearch').value.toLowerCase())).filter(value => value.customerId === this.editWardForm.get('customer_name').value)
        }
      } else {
        return this.facilityList;
      }
    }
  }

  get userWardIds() {
    if (this.caregiverForm.get('ward').value.length > 1) {
      return this.caregiverForm.get('ward').value.filter(value => value !== '');
    }
    return this.caregiverForm.get('ward').value;
  }

  getFilterWards(formType: string) {
    if (formType === 'caregiver') {
      if (this.caregiverForm.get('facility').value === '') {
        return this.wardList;
      }
      return this.wardList.filter(value => value.facility_id === this.caregiverForm.get('facility').value)
    } else {
      if (this.wardAdminForm.get('facility').value === '') {
        return this.wardList;
      }
      return this.wardList.filter(value => value.facility_id === this.wardAdminForm.get('facility').value)
    }
  }

  getCaregiver(userId: string) {
    return this.http.get(`${environment.apiUrlNew}/caregivers/get/`,{headers:this.header}).pipe(mergeMap((value: any) => {
      const caregiver = value.body.find(value => value.details.caregiver_id === userId);
      return of(caregiver)
    }))
  }

  caregiverData: any = {};
  previousWards = [];
  getCaregiverById(userId: string) {
    this.getCaregiver(userId).subscribe((data: any) => {
      let careGiverDetails = data.details;
      this.caregiverData = careGiverDetails;
      const phone = careGiverDetails.caregiver_phone.split(" ");
      if (phone.length > 0) {
        //phone[1] = phone[0];
        //phone[0] = '+91';
      }
      this.user = {
        details: {
          email: careGiverDetails.caregiver_email,
          username: `${careGiverDetails.caregiver_firstName} ${careGiverDetails.caregiver_lastName}`
        }
      };
      this.previousWards = careGiverDetails.assigned_wards.map(val => {
        return val.ward_id
      })
      this.editCaregiverForm.patchValue({
        firstName: careGiverDetails.caregiver_firstName,
        lastName: careGiverDetails.caregiver_lastName,
        ext: phone[0],
        caregiverPhoneNumber: phone[1],
        caregiverEmail: careGiverDetails.caregiver_email,
        assignWard: careGiverDetails.assigned_wards.map(val => {
          return val.ward_id
        })
      });
    })
  }

  addPhoneNumber() {
    this.contactPhone.push(this._fb.group({
      phone: ['', Validators.required],
      ext: ['+91', Validators.required]
    }));
  }

  getFFilterCaregiver() {
    return this.careGiversList.filter(value => value.facilityAdmin.toLowerCase().includes(this.editFacilityForm.get('caregiverSearch').value.toLowerCase()) && value.customerId === this.editFacilityForm.get('customer_name').value);

  }
  getFFilterFacilityAdmin() {if (this.editFacilityForm.get('customer_name').value !== '') {
    //remove duplicate values
  let obj = {};

  const unique = () => {
    let result = [];

    this.facilityList.forEach((item, i) => {
      obj[item['facilityAdmin']] = i;
    });

    for (let key in obj) {
      let index = obj[key];
      result.push(this.facilityList[index])
    }

    return result;
  }

  this.facilityList = unique();
  //
  
    const facilityadmin = this.facilityList.filter(value => value.facilityAdmin.toLowerCase().includes(this.editFacilityForm.get('caregiverSearch').value.toLowerCase()) && value.customerId === this.editFacilityForm.get('customer_name').value);
    return facilityadmin.filter(value => value.facilityAdmin.toLowerCase() != '')
  }
}

  removePhoneNumber(index: number) {
    this.contactPhone.removeAt(index)
  }

  getWards() {
    this.editCaregiverForm.valueChanges.subscribe(() => {
      this.careWadSelect.close();
    });
    this.caregiverForm.valueChanges.subscribe(() => {
      this.careSelect.close();
    });
    let wards = [];
    if (this.dialogType === 'Edit caregiver user') {
      wards = this.getFilterWards('caregiver');
    } else {
      wards = this.wardList.filter(value => (value.name.toLowerCase().includes(this.editCaregiverForm.get('wardSearch').value.toLowerCase()) || this.wardIds.includes(value.ward_number)) && value.facility_id === this.data.facility_id);
    }
    if (this.wardIds.filter(value => value !== '').length > 0) {
      const selectedUser = [];
      const notSelected = [];
      wards.forEach(value => {
        if (this.wardIds.includes(value.ward_number)) {
          selectedUser.push(value)
        } else {
          notSelected.push(value);
        }
      })
      wards = [...selectedUser, ...notSelected];
      return wards;
    } else {
      return wards;
    }
  }

  userList = [];
  getUserList() {
    this.commonHttp.getUserDetails().subscribe((facilities: any) => {
      if (facilities.itemCount > 0) {
        this.userList = facilities.body.map(value => {
          return {
            facilityName: value.details.facility_name,
            facilityId: value.details.facility_id,
            customerId: value.details.customer_id
          }
        }).sort((a: any, b: any) => {
          return a.facilityName > b.facilityName ? 1 : -1;
        });
      }
    })
  }

  users: any[] = [];
  emailCheck = true;
  checkEmails(email: string) {
    const exists = this.users.find(val => val.email === email && email !== this.user.details.email);
    if (exists) {
      this.emailCheck = false;
      return true;
    } else {
      this.emailCheck = true;
      return false;
    }
  }
  handleCAddressChange(event: any) {
    this.editCustomerForm.get('customerAddress').setValue(event.formatted_address);
  }
  getWard(ward_number: string) {
    return this.wardList.find(it => it.ward_number === ward_number)
  }
  isLoading = false;
  updateCaregiverWards = [];
  doAction() {
    this.isLoading = true;
    if (this.dialogType === 'Edit caregiver') {
      let wardsMapArray = [];
      this.wardIds.forEach((item) => {
        let ward = this.getWard(item);
        wardsMapArray.push({ ward_name: ward.name, ward_id: item })
      });
      let updateData = {
        "caregiver_id": this.caregiverData.caregiver_id,
        "caregiver_firstName": this.editCaregiverForm.get('firstName').value,
        "caregiver_lastName": this.editCaregiverForm.get('lastName').value,
        "caregiver_email": this.editCaregiverForm.get('caregiverEmail').value,
        "caregiver_phone": `${this.editCaregiverForm.get('ext').value} ${this.editCaregiverForm.get('caregiverPhoneNumber').value}`,
        "assigned_wards": wardsMapArray
      }
      this.http.put(`${environment.apiUrlNew}/caregivers/put/`, updateData,{headers:this.header}).subscribe(
        (data) => {
          const apiCalls = [];
          this.previousWards.forEach(item => {
            let updateWard: any;
            if (this.wardIds.includes(item)) {
              const ward = this.getWard(item);
              const caregivers = ward.all.details.caregivers.map(val => {
                if (val.id) {
                  return {
                    userid: val.id,
                    name: val.name
                  }
                } else if (val.userid) {
                  return {
                    userid: val.userid,
                    name: val.name
                  }
                }
              })
              const exists = caregivers.find(val => val.userid === this.caregiverData.caregiver_id);
              if (!exists) {
                caregivers.push({
                  userid: this.caregiverData.caregiver_id,
                  name: `${this.editCaregiverForm.get('firstName').value} ${this.editCaregiverForm.get('lastName').value}`
                })
              }
              updateWard = {
                ward_id: item,
                ward_name: ward.name,
                manager_id: ward.all.details.manager_id,
                manager_name: ward.all.details.manager_name,
                caregivers,
                ward_number: ward.all.details.ward_number
              };
            } else {
              const ward = this.getWard(item);
              let caregivers = ward.all.details.caregivers.map(val => {
                if (val.id) {
                  return {
                    userid: val.id,
                    name: val.name
                  }
                } else if (val.userid) {
                  return {
                    userid: val.userid,
                    name: val.name
                  }
                }
              })
              caregivers = caregivers.filter(val => val.userid !== this.caregiverData.caregiver_id)
              updateWard = {
                ward_id: item,
                ward_name: ward.name,
                manager_id: ward.all.details.manager_id,
                manager_name: ward.all.details.manager_name,
                caregivers,
                ward_number: ward.all.details.ward_number
              };
            }
            apiCalls.push(this.http.put(`${environment.apiUrlNew}/wards/put/`, updateWard,{headers:this.header}))
          })
          this.wardIds.forEach(item => {
            let updateWard: any;
            if (this.previousWards.includes(item)) {

              const ward = this.getWard(item);
              let caregivers = ward.all.details.caregivers.map(val => {
                if (val.id) {
                  return {
                    userid: val.id,
                    name: val.name
                  }
                } else if (val.userid) {
                  return {
                    userid: val.userid,
                    name: val.name
                  }
                }
              })
              caregivers = caregivers.filter(val => val.userid !== this.caregiverData.caregiver_id)
              updateWard = {
                ward_id: item,
                ward_name: ward.name,
                manager_id: ward.all.details.manager_id,
                manager_name: ward.all.details.manager_name,
                caregivers,
                ward_number: ward.all.details.ward_number
              };
            } else {
              const ward = this.getWard(item);
              const caregivers = ward.all.details.caregivers.map(val => {
                if (val.id) {
                  return {
                    userid: val.id,
                    name: val.name
                  }
                } else if (val.userid) {
                  return {
                    userid: val.userid,
                    name: val.name
                  }
                }
              })
              const exists = caregivers.find(val => val.userid === this.caregiverData.caregiver_id);
              if (!exists) {
                caregivers.push({
                  userid: this.caregiverData.caregiver_id,
                  name: `${this.editCaregiverForm.get('firstName').value} ${this.editCaregiverForm.get('lastName').value}`
                })
              }
              updateWard = {
                ward_id: item,
                ward_name: ward.name,
                manager_id: ward.all.details.manager_id,
                manager_name: ward.all.details.manager_name,
                caregivers,
                ward_number: ward.all.details.ward_number
              };
            }
            apiCalls.push(this.http.put(`${environment.apiUrlNew}/wards/put/`, updateWard,{headers:this.header}))
          })

          if (apiCalls.length > 0) {
            forkJoin(apiCalls).subscribe(() => {
              this.toastr.success('<div class="action-text"><span class="font-400">Caregiver Successfully Updated</span></div><div class="action-buttons"></div>', "", {
                timeOut: 2000,
                progressBar: true,
                enableHtml: true,
                closeButton: false,
              });
              this.common.eventEmit({ page: "caregiver" });
              this.dialogRef.close(true);
            })
          } else {
            this.toastr.success('<div class="action-text"><span class="font-400">Caregiver Successfully Updated</span></div><div class="action-buttons"></div>', "", {
              timeOut: 2000,
              progressBar: true,
              enableHtml: true,
              closeButton: false,
            });
            this.common.eventEmit({ page: "caregiver" });
            this.dialogRef.close(true);
          }
        }
      )
    } else if (this.dialogType === 'Edit ward') {
      const phoneNumbers = this.editWardForm.get('contactPhone').value.map(value => {
        return `${value.ext} ${value.phone}`;
      })
      let caregivers = [];
      this.editWardForm.get("caregiverUserid").value.forEach((item) => {
        caregivers.push({ "name": this.getName(item), "userid": item })
      });
      let updateData = {
        ward_id: this.data.wardId,
        ward_name: this.editWardForm.get('name').value,
        manager_id: this.editWardForm.get('wardManager').value,
        //manager_name: this.editWardForm.get('wardManager').value !=='' ? this.getWardManager(this.editWardForm.get('wardManager').value).managername : '',
        manager_name: this.getWardManager(this.editWardForm.get('wardManager').value).managername,
        caregivers,
        ward_number: phoneNumbers.toString()
      };
      this.http.put(`${environment.apiUrlNew}/wards/put/`, updateData,{headers:this.header}).subscribe(
        (data) => {
          const apiCalls = [];
          this.previousCaregivers.forEach(data => {
            const exists = this.caregiverUserIds.includes(data);
            if (exists) {
              const assignedWards = this.careGiversList.find(val => val.id == data).assigned_wards;
              const exist = assignedWards.find(val => val.ward_id === this.data.wardId)
              if (!exist) {
                assignedWards.push({
                  ward_id: this.data.wardId,
                  ward_name: this.editWardForm.get('name').value
                })
              }
              this.updateCaregiverWards.push({
                caregiver_id: data,
                assigned_wards: assignedWards
              })
              apiCalls.push(this.http.put(`${environment.apiUrlNew}/caregivers/update-wards/`, {
                caregiver_id: data,
                assigned_wards: assignedWards
              },{headers:this.header}))
            } else {
              const assignedWards = this.careGiversList.find(val => val.id == data).assigned_wards;
              this.updateCaregiverWards.push({
                caregiver_id: data,
                assigned_wards: assignedWards.filter(val => val.ward_id !== this.data.wardId)
              })
              apiCalls.push(this.http.put(`${environment.apiUrlNew}/caregivers/update-wards/`, {
                caregiver_id: data,
                assigned_wards: assignedWards.filter(val => val.ward_id !== this.data.wardId)
              },{headers:this.header}))
            }
          })
          this.caregiverUserIds.forEach(val => {
            const exists = this.updateCaregiverWards.find(value => value.caregiver_id === val);
            if (!exists) {
              const assignedWards = this.careGiversList.find(caregiver => caregiver.id == val).assigned_wards;
              const exist = assignedWards.find(val => val.ward_id === this.data.wardId)
              if (!exist) {
                assignedWards.push({
                  ward_id: this.data.wardId,
                  ward_name: this.editWardForm.get('name').value
                })
                this.updateCaregiverWards.push({
                  caregiver_id: val,
                  assigned_wards: assignedWards
                })
                apiCalls.push(this.http.put(`${environment.apiUrlNew}/caregivers/update-wards/`, {
                  caregiver_id: val,
                  assigned_wards: assignedWards
                },{headers:this.header}))
              }
            }
          })
          if (apiCalls.length > 0) {
            forkJoin(apiCalls).subscribe(() => {
              this.toastr.success(`<div class="action-text"><span class="font-400">${data}</span></div><div class="action-buttons"></div>`, "", {
                timeOut: 2000,
                progressBar: true,
                enableHtml: true,
                closeButton: false,
              });
              this.dialogRef.close(true);
            })
          } else {
            this.toastr.success(`<div class="action-text"><span class="font-400">${data}</span></div><div class="action-buttons"></div>`, "", {
              timeOut: 2000,
              progressBar: true,
              enableHtml: true,
              closeButton: false,
            });
            this.dialogRef.close(true);
          }
        }
      )

    } else if (this.dialogType === 'Edit room') {
      let updateData = {
        updatedBy: "",
        roomName: (this.editRoomForm.get("rooms") as FormArray).at(0).get("roomNumber").value,
        ward_number: this.data.roomData.wardId
      };
      // this.commonHttp.updateRoom(this.data.roomData.room_id, updateData).subscribe(
      //   (data) => {
      //     this.toastr.success('<div class="action-text"><span class="font-400">Ward is Successfully Updated</span></div><div class="action-buttons"></div>', "", {
      //       timeOut: 2000,
      //       progressBar: true,
      //       enableHtml: true,
      //       closeButton: false,
      //     });
      //     this.dialogRef.close(true);
      //     this.common.eventEmit({ page: "room" });
      //   }
      // )

    } else if (this.dialogType === 'Edit facility') {
      const dbPostData = {
        customer_id: this.editFacilityForm.get('customer_name').value,
        customer_name: this.getOrganization(this.editFacilityForm.get('customer_name').value).customer_name,
        facility_id: this.facility.details.facility_id,
        facility_name: this.editFacilityForm.get('facilityName').value,
        facility_address: this.editFacilityForm.get('facilityAddress').value,
        //  facility_admin: this.editFacilityForm.get('facilityAdmin').value !== "" ? this.getWardManager(this.editFacilityForm.get('facilityAdmin').value).facilityAdmin : '',
        facility_admin: this.getFacilityAdmin(this.editFacilityForm.get('facilityAdmin').value).facilityAdmin,
        facility_adminid: this.editFacilityForm.get('facilityAdmin').value,
        // facility_adminid: this.editFacilityForm.get('facilityadminid').value,
        total_wards: this.editFacilityForm.get('wardCount').value,
        created_at: this.facility.meta.created_at
      }
      this.http.post(`${environment.apiUrlNew}/facilities/put/`, dbPostData,{headers:this.header}).subscribe(data => {
        this.toastr.success(`<div class="action-text"><span class="font-400">Facility updated successfully</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        this.dialogRef.close(true);
      }, (err) => {
        this.toastr.error(`<div class="action-text"><span class="font-400">${err.error.text}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        this.dialogRef.close(false);
      })
    } else if (this.dialogType === 'Edit customer') {
      const dbPostData = {
        id: this.customer.details.id,
        customer_id: this.customer.details.customer_id,
        customer_name: this.editCustomerForm.get('customer_name').value,
        customer_status: this.editCustomerForm.get('customer_status').value,
        customer_address: this.editCustomerForm.get('customerAddress').value,
        contact_firstname: this.editCustomerForm.get('firstName').value,
        contact_lastname: this.editCustomerForm.get('lastName').value,
        contact_email: this.editCustomerForm.get('email').value,
        contact_phone: `${this.editCustomerForm.get('ext').value} ${this.editCustomerForm.get('phoneNumber').value}`,
        created_at: this.customer.meta.created_at
      }
      this.http.put(`${environment.apiUrlNew}/customers/put/`, dbPostData,{headers:this.header}).subscribe(data => {
        this.toastr.success(`<div class="action-text"><span class="font-400">Customer updated successfully</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        this.dialogRef.close(true);
      }, (err) => {
        this.toastr.error(`<div class="action-text"><span class="font-400">${err.error.text}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        this.dialogRef.close(false);
      })
    } else if (this.dialogType === 'Edit profile details') {
      const dbPostData = {
        id: this.customer.details.id,
        customer_id: this.customer.details.customer_id,
        customer_name: this.editCustomerForm.get('customer_name').value,
        customer_status: this.editCustomerForm.get('customer_status').value,
        customer_address: this.editCustomerForm.get('customerAddress').value,
        contact_firstname: this.editCustomerForm.get('firstName').value,
        contact_lastname: this.editCustomerForm.get('lastName').value,
        contact_email: this.editCustomerForm.get('email').value,
        contact_phone: `${this.editCustomerForm.get('ext').value} ${this.editCustomerForm.get('phoneNumber').value}`,
        created_at: this.customer.meta.created_at
      }
      this.http.put(`${environment.apiUrlNew}/customers/put/`, dbPostData,{headers:this.header}).subscribe(data => {
        this.toastr.success(`<div class="action-text"><span class="font-400">Customer updated successfully</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        this.dialogRef.close(true);
      }, (err) => {
        this.toastr.error(`<div class="action-text"><span class="font-400">${err.error.text}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        this.dialogRef.close(false);
      })
    } else if (this.dialogType === 'Edit customer admin') {
      const postData = {
        id: this.user.details.id,
        first_name: this.customerHqForm.get('firstName').value,
        last_name: this.customerHqForm.get('lastName').value,
        email: this.customerHqForm.get('email').value,
        phone_number: `${this.customerHqForm.get('ext').value} ${this.customerHqForm.get('phoneNumber').value}`,
      }
      this.http.put(`${environment.apiUrlNew}/users/put/`, postData,{headers:this.header}).subscribe((data: any) => {
        this.toastr.success(`<div class="action-text"><span class="font-400">${data}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        this.dialogRef.close(true);
      }, (err) => {
        this.toastr.error(`<div class="action-text"><span class="font-400">${err.error.text}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        this.dialogRef.close(false);
      })
    } else if (this.dialogType === 'Edit facility admin') {
      const postData = {
        id: this.user.details.id,
        first_name: this.facilityAdminForm.get('firstName').value,
        last_name: this.facilityAdminForm.get('lastName').value,
        email: this.facilityAdminForm.get('email').value,
        phone_number: `${this.facilityAdminForm.get('ext').value} ${this.facilityAdminForm.get('phoneNumber').value}`,
      }
      this.http.put(`${environment.apiUrlNew}/users/put/`, postData,{headers:this.header}).subscribe((data: any) => {
        this.toastr.success(`<div class="action-text"><span class="font-400">${data}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        this.dialogRef.close(true);
      }, (err) => {
        this.toastr.error(`<div class="action-text"><span class="font-400">${err.error.text}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        this.dialogRef.close(false);
      })
    } else if (this.dialogType === 'Edit ward admin') {
      const postData = {
        id: this.user.details.id,
        first_name: this.wardAdminForm.get('firstName').value,
        last_name: this.wardAdminForm.get('lastName').value,
        email: this.wardAdminForm.get('email').value,
        phone_number: `${this.wardAdminForm.get('ext').value} ${this.wardAdminForm.get('phoneNumber').value}`
      }
      this.http.put(`${environment.apiUrlNew}/users/put/`, postData,{headers:this.header}).subscribe((data: any) => {
        this.toastr.success(`<div class="action-text"><span class="font-400">${data}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        this.dialogRef.close(true);
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
        this.dialogRef.close(false);
      })
    } else if (this.dialogType === 'Edit caregiver user') {
      const postData = {
        id: this.user.details.id,
        first_name: this.caregiverForm.get('firstName').value,
        last_name: this.caregiverForm.get('lastName').value,
        email: this.caregiverForm.get('email').value,
        phone_number: `${this.caregiverForm.get('ext').value} ${this.caregiverForm.get('phoneNumber').value}`
      }
      this.http.post(`${environment.apiUrlNew}/users/update-caregiver/`, postData,{headers:this.header}).subscribe((data: any) => {
        const apiCalls = [];
        this.previousWards.forEach(item => {
          let updateWard: any;
          if (this.wardIds.includes(item)) {
            const ward = this.getWard(item);
            const caregivers = ward.all.details.caregivers.map(val => {
              if (val.id) {
                return {
                  userid: val.id,
                  name: val.name
                }
              } else if (val.userid) {
                return {
                  userid: val.userid,
                  name: val.name
                }
              }
            })
            const exists = caregivers.find(val => val.userid === this.caregiverData.caregiver_id);
            if (!exists) {
              caregivers.push({
                userid: this.caregiverData.caregiver_id,
                name: `${this.editCaregiverForm.get('firstName').value} ${this.editCaregiverForm.get('lastName').value}`
              })
            }
            updateWard = {
              ward_id: item,
              ward_name: ward.name,
              manager_id: ward.all.details.manager_id,
              manager_name: ward.all.details.manager_name,
              caregivers,
              ward_number: ward.all.details.ward_number
            };
          } else {
            const ward = this.getWard(item);
            let caregivers = ward.all.details.caregivers.map(val => {
              if (val.id) {
                return {
                  userid: val.id,
                  name: val.name
                }
              } else if (val.userid) {
                return {
                  userid: val.userid,
                  name: val.name
                }
              }
            })
            caregivers = caregivers.filter(val => val.userid !== this.caregiverData.caregiver_id)
            updateWard = {
              ward_id: item,
              ward_name: ward.name,
              manager_id: ward.all.details.manager_id,
              manager_name: ward.all.details.manager_name,
              caregivers,
              ward_number: ward.all.details.ward_number
            };
          }
          apiCalls.push(this.http.put(`${environment.apiUrlNew}/wards/put/`, updateWard,{headers:this.header}))
        })
        this.userWardIds.forEach(item => {
          let updateWard: any;
          if (this.previousWards.includes(item)) {

            const ward = this.getWard(item);
            let caregivers = ward.all.details.caregivers.map(val => {
              if (val.id) {
                return {
                  userid: val.id,
                  name: val.name
                }
              } else if (val.userid) {
                return {
                  userid: val.userid,
                  name: val.name
                }
              }
            })
            caregivers = caregivers.filter(val => val.userid !== this.caregiverData.caregiver_id)
            updateWard = {
              ward_id: item,
              ward_name: ward.name,
              manager_id: ward.all.details.manager_id,
              manager_name: ward.all.details.manager_name,
              caregivers,
              ward_number: ward.all.details.ward_number
            };
          } else {
            const ward = this.getWard(item);
            const caregivers = ward.all.details.caregivers.map(val => {
              if (val.id) {
                return {
                  userid: val.id,
                  name: val.name
                }
              } else if (val.userid) {
                return {
                  userid: val.userid,
                  name: val.name
                }
              }
            })
            const exists = caregivers.find(val => val.userid === this.caregiverData.caregiver_id);
            if (!exists) {
              caregivers.push({
                userid: this.caregiverData.caregiver_id,
                name: `${this.editCaregiverForm.get('firstName').value} ${this.editCaregiverForm.get('lastName').value}`
              })
            }
            updateWard = {
              ward_id: item,
              ward_name: ward.name,
              manager_id: ward.all.details.manager_id,
              manager_name: ward.all.details.manager_name,
              caregivers,
              ward_number: ward.all.details.ward_number
            };
          }
          apiCalls.push(this.http.put(`${environment.apiUrlNew}/wards/put/`, updateWard,{headers:this.header}))
        })
        this.toastr.success(`<div class="action-text"><span class="font-400">${data}</span></div><div class="action-buttons"></div>`, "", {
          timeOut: 2000,
          progressBar: true,
          enableHtml: true,
          closeButton: false,
        });
        this.dialogRef.close(true);
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
        this.dialogRef.close(false);
      })
    }
  }
  getFacilityValue(id: any) {
    return this.facilityList.find(value => value.facilityId === id);
  }
  getManager(caregiverId: string) {
    return this.careGiversList.find(it => it.id === caregiverId)
  }
  getWardManager(id: string) {
    return this.wardList.find(it => it.managerid === id)
  }
  getFacilityAdmin(id: string) {
    return this.facilityList.find(it => it.facilityadminid === id)
  }
  getOrganization(id: string) {
    return this.customerList.find(it => it.customer_id === id)
  }
  validate() {
    if (this.dialogType === 'Edit ward') {
      return !(this.editWardForm.valid) || this.editWardForm.pristine || this.isLoading || this.checkWardExists();
    } else if (this.dialogType === 'Edit room') {
      return !(this.editRoomForm.valid) || this.editRoomForm.pristine || this.isLoading;
    } else if (this.dialogType === 'Edit caregiver') {
      return !(this.editCaregiverForm.valid) || this.editCaregiverForm.pristine || this.isLoading;
    } else if (this.dialogType === 'Edit customer') {
      return this.editCustomerForm.invalid || this.editCustomerForm.pristine || this.checkCustomerExists() || this.isLoading;
    } else if (this.dialogType === 'Edit profile details') {
      return this.editCustomerForm.invalid || this.editCustomerForm.pristine || this.checkCustomerExists() || this.isLoading;
    } else if (this.dialogType === 'Edit facility') {
      return this.editFacilityForm.invalid || this.editFacilityForm.pristine || this.checkFacilityExists() || this.isLoading;
    } else if (this.dialogType === 'Edit customer admin') {
      return this.customerHqForm.invalid || this.customerHqForm.pristine || this.isLoading
    } else if (this.dialogType === 'Edit facility admin') {
      return this.facilityAdminForm.invalid || this.facilityAdminForm.pristine || this.isLoading
    } else if (this.dialogType === 'Edit ward admin') {
      return this.wardAdminForm.invalid || this.wardAdminForm.pristine || this.isLoading
    } else if (this.dialogType === 'Edit caregiver user') {
      return this.caregiverForm.invalid || this.caregiverForm.pristine || this.isLoading || this.userWardIds.filter(value => value !== '').length < 1
    }
  }
  close() {
    this.dialogRef.close();
  }
}
