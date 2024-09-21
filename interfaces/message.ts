// 메세지 인터페이스 정의하고 외부 노출
export interface IMessage {
  user_type: UserType;
  message: string;
  send_date: Date;
}

// 사용자 타입 열거형 정의하고 외부 노출
export enum UserType {
  USER = 'User',
  BOT = 'Bot',
}

// IMessage에 nick_name 속성이 추가된 새로운 인터페이스 정의
export interface IMemberMessage extends IMessage {
  nick_name: string;
}
