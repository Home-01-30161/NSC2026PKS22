graph TD
    A([Victory Screen<br/>Knowledge Card + Grade]) --> B[รับ API Credits<br/>ตาม Grade ที่ได้]
    B --> C[Unlock Node ถัดไป]
    C --> D{ครบ 3 Acts?}
    
    %% เงื่อนไขครบ 3 Acts
    D -- ยังไม่ครบ --> E[World Map]
    D -- ครบแล้ว --> F[รวมคะแนน Overwrite<br/>และหาค่าเฉลี่ย<br/>ทั้ง 3 Acts]
    
    %% ตรวจสอบ Battle Grade เฉลี่ย
    F --> G{Battle Grade เฉลี่ย}
    
    G -- "Battle Grade S ถึง B<br/>ทุก Prompt Human-<br/>centered" --> H([Ending A<br/>The Lattice กลายเป็น<br/>Global AI Assistant])
    
    G -- "Battle Grade C ลงไป<br/>Prompt ไม่สมบูรณ์" --> I([Ending B<br/>The Lattice ถูก Restrict<br/>ทำงานใต้ Human<br/>Supervision])
    
    G -- "เลือก Destroy<br/>แทน Overwrite" --> J([Ending C<br/>The Lattice ถูก Shutdown<br/>มีคนกำลัง Rebuild ใหม่])