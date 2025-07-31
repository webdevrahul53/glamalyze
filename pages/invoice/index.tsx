import { APPOINTMENTS_API_URL, SERVICES_API_URL } from '@/core/utilities/api-url';
import { useRouter } from 'next/router';
import React, { useRef } from 'react';

const InvoicePage: React.FC = () => {
    const router = useRouter();
    const invoiceRef = useRef<HTMLDivElement>(null);
    const [selectedAppointment, setSelectedAppointment] = React.useState<any>();
    const [serviceList, setServiceList] = React.useState<any>([]);
    const [totalDiscount, setTotalDiscount] = React.useState<number>(0);
    const [totalVoucherDiscount, setTotalVoucherDiscount] = React.useState<number>(0);
    const [totalPrice, setTotalPrice] = React.useState<number>(0);

    React.useEffect(() => {
        getServiceList()
    }, [])

    React.useEffect(() => {
        const { _id } = router.query;
        if (_id) {
            getBookingsById(_id as string);
        }
    }, [router.query]);
    
    const getServiceList = async () => {
        try {
            const services = await fetch(SERVICES_API_URL)
            const parsed = await services.json();
            setServiceList(parsed)
          }catch(err:any) {  }
    }
    
      
    const getBookingsById = async (id: string) => {
        if(!id) return;
        try {
            const branches = await fetch(`${APPOINTMENTS_API_URL}/${id}`)
            let parsed = await branches.json();
          
            let discount = 0;
            let voucher = 0;
            let total = 0;
            parsed.pax = Object.values(
                parsed.pax.reduce((acc: any, item: any) => {
                    // Calculate total discount and voucher discount
                    discount += item.discount;
                    voucher += item.voucherDiscount;
                    total += item.price;
                    acc[item.paxId] = acc[item.paxId] || [];
                    acc[item.paxId].push(item);
                    return acc;
                }, {})
            );
            console.log(parsed);
            setTotalDiscount(discount);
            setTotalVoucherDiscount(voucher);
            setTotalPrice(total);
  
            setSelectedAppointment(parsed)
          
        }catch(err:any) {  }
  
    }
    const handlePrint = () => {
        if (!invoiceRef.current) return;
        const printContents = invoiceRef.current.innerHTML;
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();
    };


    return (
        <div style={{ padding: 16, fontFamily: 'Segoe UI, sans-serif', background: '#f9f9f9' }}>
            <button onClick={handlePrint} className="no-print" style={{ marginBottom: 12, padding: '6px 12px' }}>
                🖨️ Print Invoice
            </button>

            <div ref={invoiceRef} style={{
                maxWidth: 800,
                margin: 'auto',
                background: '#fff',
                padding: 24,
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                fontSize: 14
            }}>
                {/* <h2 style={{ textAlign: 'center', marginBottom: 16 }}>INVOICE</h2> */}
                <div style={{
                    background: '#1E293B', // dark slate blue
                    color: '#fff',
                    padding: '20px 24px',
                    borderRadius: '8px 8px 0 0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: 24, letterSpacing: 1 }}>Bliss Spa & Wellness</h1>
                        <p style={{ margin: 0, fontSize: 12 }}>123 Spa Street, Bangkok · +66 1234 5678</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h2 style={{ margin: 0, fontSize: 28, color: '#facc15' }}>INVOICE</h2>
                        <p style={{ margin: 0, fontSize: 12 }}>Date: {selectedAppointment?.appointmentDate?.slice(0, 10)} {selectedAppointment?.startTime} </p>
                        <p style={{ margin: 0, fontSize: 12 }}>Booking ID: {selectedAppointment?.pax[0][0].bookingId}</p>
                    </div>
                </div>

                {/* <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                        <p><strong>Booking ID:</strong> {selectedAppointment?.bookingId}</p>
                        <p><strong>Date:</strong> {selectedAppointment?.appointmentDate}</p>
                        <p><strong>Start:</strong> {selectedAppointment?.startTime}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p><strong>Payment:</strong> {selectedAppointment?.paymentStatus}</p>
                        <p><strong>Method:</strong> {selectedAppointment?.paymentMethod}</p>
                        <p><strong>Task:</strong> {selectedAppointment?.taskStatus}</p>
                    </div>
                </div> */}

                <hr />

                {selectedAppointment?.pax.map((pax:any, index:number) => (
                    <div key={index} style={{ marginTop: 20 }}>
                        <h4 style={{ marginBottom: 8 }}>👤 Person {index+1}</h4>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f1f1f1' }}>
                                    <th style={thStyle}>Service</th>
                                    <th style={thStyle}>Duration</th>
                                    <th style={thStyle}>Price</th>
                                    <th style={thStyle}>Asset</th>
                                    <th style={thStyle}>Employees</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pax?.map((service:any, sIdx:number) => {
                                    let asset = service?.assetList?.find((i:any) => i._id === service?.assetId);
                                    let serv = serviceList.find((i:any) => i._id === service?.serviceId);
                                    return (
                                        <tr key={sIdx}>
                                            <td style={tdStyle}>{serv.name}</td>
                                            <td style={tdStyle}>{service.duration}m</td>
                                            <td style={tdStyle}>₹{service.price}</td>
                                            <td style={tdStyle}> {asset?.assetType} #{asset?.assetNumber}</td>
                                            <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                                                {service?.employeeId?.map((emp: any, eIdx: number) => {
                                                    let employee = service.employeeList.find((i: any) => i._id === emp);
                                                    return (
                                                        <span key={eIdx} style={{ display: 'inline-flex', alignItems: 'center', marginRight: 8 }}>
                                                            {/* <img src={employee.image} alt={employee.name} style={{ width: 20, height: 20, borderRadius: '50%', marginRight: 4 }} /> */}
                                                            {employee.firstname} {employee.lastname},
                                                        </span>
                                                    )
                                                })}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                ))}

                <hr style={{ marginTop: 24 }} />

                <div style={{ textAlign: 'right', marginTop: 8 }}>
                    {/* <p><strong>Duration:</strong> {selectedAppointment?.totalDuration} mins</p> */}
                    <p><strong>Price:</strong> {totalPrice || "0.00"}</p>
                    <p><strong>Voucher Discount:</strong> {totalVoucherDiscount || "0.00"}</p>
                    <p><strong>Discount:</strong> {totalDiscount || "0.00"}</p>
                    <p><strong>SubTotal:</strong> {selectedAppointment?.totalAmount || "0.00"}</p>
                    <p><strong>CGST:</strong> ฿ {(selectedAppointment?.totalAmount * 0.09).toFixed(2)}</p>
                    <p><strong>IGST:</strong> ฿ {(selectedAppointment?.totalAmount * 0.09).toFixed(2)}</p>
                    <p style={{ fontSize: 16 }}><strong>Total Amount:</strong> ฿ {(selectedAppointment?.totalAmount + (selectedAppointment?.totalAmount * 0.18)).toFixed(2)}</p>
                </div>
            </div>

            {/* Print-only styles */}
            <style>
                {`
                @media print {
                    .no-print {
                        display: none;
                    }
                    body {
                        margin: 0;
                        -webkit-print-color-adjust: exact;
                    }
                }
                `}
            </style>
        </div>
    );
};

const thStyle: React.CSSProperties = {
    padding: '8px',
    textAlign: 'left',
    border: '1px solid #ccc',
    fontWeight: 600
};

const tdStyle: React.CSSProperties = {
    padding: '8px',
    textAlign: 'left',
    border: '1px solid #ddd',
};

export default InvoicePage;
