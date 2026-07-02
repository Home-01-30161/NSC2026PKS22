graph TD
    A[Unlock Node ถัดไป] --> B{แวะ Shop?}
    
    B -- ใช่ --> C([Shop Screen])
    B -- ไม่ --> End[ ]
    
    C --> D{เลือกสินค้า}
    
    %% เส้นทางเมื่อเลือกสินค้า
    D -- API Credits เพียงพอ --> E[ซื้อ Skill / MCP Tool]
    D -- API Credits ไม่พอ --> F[/แจ้งเตือน Credits ไม่เพียงพอ/]
    F --> D
    
    %% หลังจากซื้อสำเร็จ
    E --> G[อัปเดต Skill Loadout<br/>หัก API Credits]
    
    %% ตรวจสอบการซื้อต่อ
    G --> H{ซื้อต่อ?}
    H -- ใช่ --> D
    H -- ออกจาก Shop --> End
    
    %% กำหนดสไตล์กล่องสุดท้ายให้เป็นกล่องทึบสีเข้มตามภาพ
    style End fill:#1e1e2e,stroke:#1e1e2e,width:50px,height:25px