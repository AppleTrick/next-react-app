/* eslint-disable @typescript-eslint/no-unused-vars */

// 기본 호출 주소 : http://localhost:3000/api/bot

// next 패키지 내에서 클라이언트 요청과 서버 응답 객체의 타입 참조
import type { NextApiRequest, NextApiResponse } from 'next';

// LangChain에서 제공하는 시스템 메세지 (역할기반챗봇지정) 과 휴먼메세지 타입 참조하기
// System Message : LLM 챗봇에게 역할을 지정할때 사용함
// HumanMessage : LLM 챗봇에 전달할 사용자메세지 타입이다.
import { SystemMessage, HumanMessage } from '@langchain/core/messages';

// 프롬프트 템플릿 참조하기
import { ChatPromptTemplate } from '@langchain/core/prompts';

// LLM 응답 메세지 타입을 원하는 타입결과물과 파싱해주는 아웃풋참조하기
// StringOutputParser 는 AIMessage 타입에서 content 속성값만 문자열로 반환해주는 파서이다.
import { StringOutputParser } from '@langchain/core/output_parsers';

// 메세지 인터페이스 타입참조
import { IMemberMessage, UserType } from '@/interfaces/message';

import { ChatOpenAI } from '@langchain/openai';

// 백엔드에서 프론트엔드로 전달할 결과 데이터 정의하기
type ResponseData = {
  code: number;
  data: string | null | IMemberMessage;
  msg: string;
};

// 백엔드 REST API 기능을 제공해주는 처리함수
// req는 클라이언트에서 서버로 제공되는 각종정보를 포함하는 매개변수이고 타입은 NextApiRequest 이다.
// res는 백엔드 API 에서 클라이언트로 전달할 결과값을 처리하는 객체이다.

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  // 클라이언트로 전달한 최정 데이터 값 정의하기
  const apiResult: ResponseData = {
    code: 400,
    data: null,
    msg: 'failed',
  };

  try {
    if (req.method == 'POST') {
      //Step1 : 프론트엔드에서 전달한 데이터값 추출하기

      const nickname = req.body.nickname;
      const prompt = req.body.message;

      // Step2 : LLM 모델 생성하기
      const llm = new ChatOpenAI({
        model: 'gpt-4o',
        apiKey: process.env.OPENAI_API_KEY,
      });

      //Step3 : LLM 과 통신하기
      // CASE1. 심플 챗봇
      // const result = await llm.invoke(prompt);

      // CASE2. 역할기반 챗봇
      // const messages = [
      //   new SystemMessage('내가 보낸 메세지를 일본어로 번역해줘'),
      //   new HumanMessage(prompt),
      // ];
      // const result = await llm.invoke(messages);

      // result 메세지 타입은 AIMessage 타입으로 변환된다.

      // CASE3 : 프롬프트 템플릿을 이용한 메세지를 전달하고 응답받기
      const promptTemplate = ChatPromptTemplate.fromMessages([
        ['system', '내가 보낸 메세지를 영어로 번역해줘'],
        ['user', '{input}'],
      ]);

      // LLM outputParser를 이용해 응답메세지를 문자열로 변환하기
      const outputparsers = new StringOutputParser();

      // LLM 에 질물과 응답과정에서 발생하는 작업의 단위를 chain이라고 한다.
      // 여러개의 체인을 연결해 최종 사용자 질문에 응답을 받는 방법을 LangChain에서는 파이프라인 이라고한다.
      // CASE 3-1 : 프롬프트 템플릿을 이용한 메세지 전달하고 응답받기
      // const chain = promptTemplate.pipe(llm);
      // const result = await chain.invoke({ input: prompt });

      // CASE 3-2 : outputparser를 이용한 2개의 체인을 실행하기
      const chains = promptTemplate.pipe(llm).pipe(outputparsers);

      // output parser를 이용했기 때문에 invoke 결과값이 AIMessage 문자열로 반환된다.
      const resultMessage = await chains.invoke({ input: prompt });

      // console.log('LLM 모델에서 전달된 챗봇 응답 결과값 : ' + result);

      // Step 4 : 챗봇 응답 메세지를 프론트엔드 메세지 타입으로 변환하여 결과 값 반환하기
      const resultMsg: IMemberMessage = {
        user_type: UserType.BOT,
        nick_name: 'BOT',
        message: resultMessage, // result.content as string,
        send_date: new Date(),
      };

      // LLM 챗봇과 통신해서 LLM 이 제공해주는 응답값을 받아서 apiResult data 값으로 전달하기
      apiResult.code = 200;
      //   apiResult.data = '무엇을 도와드릴까요?' + nickname;
      apiResult.data = resultMsg;
      apiResult.msg = 'ok';
    }
  } catch (err) {
    // LLM 통신시 에러발생시 예외처리코드 영역
    console.log('백엔드 API 호출에서 에러 발생 ', err);
    apiResult.code = 500;
    apiResult.data = null;
    apiResult.msg = 'failed';
  }

  // 클라이언트에 최종 API 결과값을 JSON 형태로 전달하기
  // res.json() 메소드 안에 최종결과 json 데이터를 넣어서 클라이언트로 전달한다.
  res.json(apiResult);
}
