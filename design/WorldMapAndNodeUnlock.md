graph TD
    A([Title Screen]) --> B[World Map]
    B --> C{เลือก Node}
    C -- Locked --> D[/แจ้งเตือน ต้องปราบศัตรูก่อน/]
    D --> B
    C -- Unlocked --> E[โหลด Enemy Data<br/>Hallucination Type, HP<br/>Enemy HP, Weakness List]
    E --> F([Battle Screen])