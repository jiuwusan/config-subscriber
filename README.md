# config-subscriber
config-subscriber

# 构建 docker 镜像
docker build -t config-subscriber:1.0.0 .

# 添加 tag
# docker tag $web_app_name:$version docker.xinshucredit.com/riskalter/$web_app_name:$version
docker tag $image_tag_name localhost/$project_name/$image_tag_name

# 将镜像推送到 私有仓库
# docker push docker.xinshucredit.com/$web_app_name/riskalter:$version
docker push localhost/$project_name/$image_tag_name

# 删除构建 builder 缓存
docker builder prune -f
docker system prune -f

# 运行 
docker run -itd -e TZ=Asia/Shanghai -e DELUGE_LOGLEVEL=error --network=wk --name=config-subscriber-server --restart=always config-subscriber:1.0.0