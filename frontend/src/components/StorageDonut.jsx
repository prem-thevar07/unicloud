import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const StorageDonut = ({ used, total }) => {
  return (
    <div className="card">
      <h3>Cloud Storage</h3>
      <Doughnut
        data={{
          labels: ["Used", "Free"],
          datasets: [
            {
              data: [used, total - used],
              backgroundColor: ["#8b5cf6", "#1f2937"],
              borderWidth: 0,
            },
          ],
        }}
      />
      <p className="center">
        {used} GB / {total} GB
      </p>
    </div>
  );
};

export default StorageDonut;
