graph TD
    A([Battle Screen]) --> B{เลือก Action}
    
    %% เส้นทางจากเลือก Action
    B -- Scan --> C[เปิด Intel Panel<br/>ดู Weakness + Type]
    C --> B
    
    B -- Skill --> D[คำนวณ Damage<br/>Weakness Multiplier × Scan<br/>Bonus]
    B -- Guard --> E[ตั้งรับ<br/>ลด Damage 50%]
    
    %% ตรวจสอบ Enemy HP
    D --> F{Enemy HP}
    E --> F
    
    F -- HP = 0 --> G([Overwrite Mode])
    F -- HP > 0 --> H[QTE Overlay<br/>กด Space ให้ตรง Green<br/>Zone]
    
    %% ผลลัพธ์ QTE
    H --> I{ผลลัพธ์ QTE}
    I -- Perfect --> J[Damage = 0<br/>ปัดการโจมตีได้]
    I -- Good --> K[Damage ลด 60%]
    I -- Miss --> L[รับ Full Damage]
    
    %% ตรวจสอบ HP ของ Mari
    J --> M{HP ของ Mari}
    K --> M
    L --> M
    
    M -- HP = 0 --> N([Restart Battle])
    N --> A
    
    M -- HP > 0 --> O[Turn ถัดไป<br/>Regen Context Tokens +10]
    O --> B