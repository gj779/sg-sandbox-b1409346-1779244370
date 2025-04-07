import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardBody, CardHeader, CardTitle, Col, Row } from 'reactstrap'
import { BackBtn } from '../../../components/allButtons'
import { chatData } from '../../../data/dummyData'
import { color } from '../../../utility/color'

const Chat = () => {

  const navigate = useNavigate();
  return (
    <div>
      <Row>
        <Col md='8' sm="10">
          <Card style={{ overflowY: "auto", boxShadow: color.shadow, backgroundColor: color.secondary, color: color.primary, marginTop: "10px" }}>
            <CardHeader className='card-header'>
            <BackBtn onClick={() => navigate(-1)} />
              <CardTitle tag={'h4'} style={{ padding: "10px 0" }}>User Chat</CardTitle>
            </CardHeader>
            <CardBody style={{
              maxHeight: `${window.innerHeight - 400}px`, overflowY: 'auto'

            }}>
              <Col >
                <div style={{ display: "flex", flex: 1, flexDirection: 'column' }}>
                  {
                    chatData.map((e, index) => {
                      return (
                        <div key={index} style={{
                          backgroundColor: e?.id == 1 ? '#0d6efd' : '#EFEFEF', justifyContent: 'center',
                          alignItems: 'center',
                          alignSelf: e?.id == 1 ? 'flex-end' : 'flex-start',
                          marginTop: "10px", borderRadius: "20px"

                        }}>
                          <p style={{ textAlign: e?.id == 1 ? "right" : "left", color: e.id==1 ?  '#EFEFEF':color.primary, padding: "10px 10px 5px 10px", }}>
                            {e?.message}
                          </p>
                        </div>
                      )
                    })
                  }
                </div>
              </Col>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Chat