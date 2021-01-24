import io from "socket.io-client";
import { useCallback, useEffect, useState } from "react";
import { Progress, message } from "antd";
import styles from "./style.module.css";

const useForceUpdate = () => {
  const [, setTick] = useState(0);
  const update = useCallback(() => {
    setTick((tick) => tick + 1);
  }, []);
  return update;
};

const usePodCount = () => {
  const [podMap, setPodStatus] = useState<
    Record<string, Record<"count" | "percent" | "isLive", number>>
  >({});
  const forceUpdate = useForceUpdate();

  useEffect(() => {
    const socket = io();
    socket.on("connect", () => {
      console.log(`connected, socket_id: ${socket.id}`);
    });
    socket.on("disconnect", () => {
      console.log("socket disconnected!!");
    });
    socket.on("NOTICE_EXEC_API", (podName: string) => {
      if (!podMap[podName]) {
        podMap[podName] = {
          count: 0,
          percent: 0,
          isLive: 1,
        };
        podMap[podName].count = 1;
      } else {
        podMap[podName].count++;
      }
      setPodStatus(podMap);
      forceUpdate(); // TODO
    });
    socket.on("NOTICE_SHUTDOWN", (deletedPodName: string) => {
      message.error(`pod is deleted! ${deletedPodName}`);

      Object.keys(podMap).forEach((podName) => {
        const currentStatus = podMap[podName];
        if (podName === deletedPodName) {
          podMap[podName] = {
            ...currentStatus,
            isLive: 0,
          };
        }
      });
      setPodStatus(podMap);
      forceUpdate(); // TODO
    });

    return () => {
      socket.close();
    };
  }, []);

  return podMap;
};

export default function Home() {
  const podMap = usePodCount();
  const counts = Object.keys(podMap).map((podName) => podMap[podName].count);
  const max = Math.max(...counts);

  return (
    <div className={styles.container}>
      {Object.keys(podMap).map((podName) => {
        const isLive = podMap[podName].isLive;
        const progressStatus = isLive ? "active" : "exception";
        const strokeColor = isLive
          ? {
              "0%": "#5ee7df",
              "100%": "#b490ca",
            }
          : {
              "0%": "#f093fb",
              "100%": "#f5576c",
            };
        const count = podMap[podName].count;
        const percent = (count / max) * 100;
        return (
          <div key={podName} className={styles.inner}>
            <p className={styles.desc}>ポッド名: {podName}</p>
            <p className={styles.desc}>リクエスト回数: {count}</p>
            <Progress
              percent={percent}
              showInfo={false}
              status={progressStatus}
              strokeColor={strokeColor}
            />
          </div>
        );
      })}
    </div>
  );
}
